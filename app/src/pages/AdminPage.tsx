import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";
import { useAuth } from "../hooks/AuthProvider";
import AdminLayout from "../components/AdminLayout";
import MdxTextEditor from "../components/MdxTextEditor";

type ContentModule = {
  id: string;
  slug: string;
  title: string;
  type: "text" | "pdf" | "video";
  body_md?: string | null;
  file_url?: string | null;
  status: string;
};

type NewModuleFormState = {
  type: "text" | "pdf" | "video";
  title: string;
  slug: string;
  body_md: string;
  file_url: string;
};

type ContentModulePayload = {
  title: string;
  slug: string;
  type: "text" | "pdf" | "video";
  status: string;
  body_md: string | null;
  file_url: string | null;
};

function formatSbError(err: any) {
  if (!err) return "unknown error";
  return [
    err.message ?? "no message",
    err.code ? `code=${err.code}` : null,
    err.details ? `details=${err.details}` : null,
    err.hint ? `hint=${err.hint}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function useSessionDraft(key: string, initial = "") {
    const [value, setValue] = useState(() => {
      return sessionStorage.getItem(key) ?? initial;
    });

    useEffect(() => {
      sessionStorage.setItem(key, value);
    }, [key, value]);

    return [value, setValue] as const;
  }

// Bucket je nach Modultyp auswählen
function getBucketForType(type: "text" | "pdf" | "video") {
  if (type === "pdf") return "PDF";
  if (type === "video") return "videos";
  return "Text";
}

/**
 * Extrahiert bucket + path aus Supabase Storage URLs.
 * Unterstützt:
 *  - /storage/v1/object/public/<bucket>/<path>
 *  - /storage/v1/object/sign/<bucket>/<path>
 * Gibt null zurück bei externen URLs.
 */
function parseSupabaseStorageObject(
  fileUrl: string,
): { bucket: string; path: string } | null {
  try {
    const u = new URL(fileUrl);
    const markers = ["/storage/v1/object/public/", "/storage/v1/object/sign/"];
    const marker = markers.find((m) => u.pathname.includes(m));
    if (!marker) return null;

    const rest = u.pathname.split(marker)[1]; // "<bucket>/<path...>"
    const [bucket, ...pathParts] = rest.split("/").filter(Boolean);
    if (!bucket || pathParts.length === 0) return null;

    return { bucket, path: pathParts.join("/") };
  } catch {
    return null;
  }
}

const normText = (s: string | null | undefined) =>
  (s ?? "").replace(/\r\n/g, "\n").trimEnd();

export default function AdminPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tabs aktiv erkennen (aktuell nicht im JSX genutzt – gelassen wie bei dir)
  const isQuestions = location.pathname.startsWith("/admin/questions");
  const isRouting = location.pathname.startsWith("/admin/decision-trees");
  const isContent = !isQuestions && !isRouting;

  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const [savingModule, setSavingModule] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [form, setForm] = useState<NewModuleFormState>({
    type: "text",
    title: "",
    slug: "",
    body_md: "",
    file_url: "",
  });

  const [draftBody, setDraftBody] = useSessionDraft(
  "admin:text:draft",
  "",
);


  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit-Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  // ✅ Schutz vor Race Conditions, wenn man schnell mehrfach "Bearbeiten" klickt
  const editReqRef = useRef(0);

  const busy = savingModule || uploading || loadingEdit;

  useEffect(() => {
    void loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadModules() {
    setLoadingModules(true);
    setError(null);

    const { data, error } = await supabase
      .from("content_modules")
      .select("id, slug, title, type, body_md, file_url, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Inhalte konnten nicht geladen werden.");
    } else {
      setModules((data ?? []) as ContentModule[]);
    }

    setLoadingModules(false);
  }

  function resetForm() {
    // laufende edit-requests invalidieren
    editReqRef.current++;

    setEditingId(null);
    setUploadError(null);
    setError(null);
    setInfo(null);

    setForm({
      type: "text",
      title: "",
      slug: "",
      body_md: "",
      file_url: "",
    });

    sessionStorage.removeItem("admin:text:draft");
    setDraftBody("");

  }

  // ✅ BUGFIX: editingId erst setzen NACHDEM der frische body_md da ist
  // + Race Condition Schutz
  async function startEdit(m: ContentModule) {
    setError(null);
    setInfo(null);
    setUploadError(null);
    setLoadingEdit(true);

    const reqId = ++editReqRef.current;

    const fresh = await supabase
      .from("content_modules")
      .select("id, slug, title, type, body_md, file_url, status")
      .eq("id", m.id)
      .single();

    // wenn zwischenzeitlich ein anderer "Bearbeiten"-Klick kam: ignore
    if (reqId !== editReqRef.current) return;

    setLoadingEdit(false);

    if (fresh.error) {
      console.error("START EDIT load failed:", fresh.error);
      setError(
        `Modul konnte nicht geladen werden: ${formatSbError(fresh.error)}`,
      );
      return;
    }

    const row = fresh.data;
    const body = row.body_md ?? "";

    // 1) erst Form mit frischem Content setzen
    setForm({
      type: row.type,
      title: row.title,
      slug: row.slug,
      body_md: row.body_md ?? "",
      file_url: row.file_url ?? "",
    });

    setDraftBody(body);
    sessionStorage.setItem("admin:text:draft", body); 

    // 2) dann edit mode setzen (damit Editor erst jetzt remountet)
    setEditingId(row.id);

  }

  function setField<K extends keyof NewModuleFormState>(
    key: K,
    value: NewModuleFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileUpload(file: File) {
    if (form.type === "text") {
      setUploadError("Dateiupload ist nur für PDF- und Video-Module möglich.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setError(null);
    setInfo(null);

    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const safeSlug = (form.slug.trim() || "module")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");

      const filePath = `modules/${Date.now()}_${safeSlug}.${ext}`;
      const bucket = getBucketForType(form.type);

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) {
        console.error("UPLOAD ERROR:", uploadErr);
        setUploadError(
          uploadErr.message ?? "Datei konnte nicht hochgeladen werden.",
        );
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setForm((prev) => ({ ...prev, file_url: data.publicUrl }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveModule(e: React.FormEvent) {
    e.preventDefault();
    setSavingModule(true);
    setError(null);
    setInfo(null);

    try {
      const title = form.title.trim();
      const slug = form.slug.trim();

      if (!title || !slug) {
        setError("Titel und Kurzname sind Pflichtfelder.");
        return;
      }

      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");

      const payload: ContentModulePayload = {
        title,
        slug: normalizedSlug,
        type: form.type,
        status: "published",
        body_md: null,
        file_url: null,
      };

      if (form.type === "text") {
        payload.body_md = normText(form.body_md);
      } else {
        payload.file_url = form.file_url ?? "";
      }

      if (editingId) {
        const upd = await supabase
          .from("content_modules")
          .update(payload)
          .eq("id", editingId);

        if (upd.error) {
          setError(`Update fehlgeschlagen: ${formatSbError(upd.error)}`);
          return;
        }

        await loadModules();
        setInfo("Änderungen gespeichert.");
        return;
      }

      const res = await supabase
        .from("content_modules")
        .insert([payload])
        .select("id, slug, title, type, body_md, file_url, status, updated_at")
        .single();

      if (res.error) {
        setError(`Insert fehlgeschlagen: ${formatSbError(res.error)}`);
        return;
      }

      setInfo("Modul angelegt.");
      resetForm();
      await loadModules();
    } catch (err) {
      console.error("SAVE unexpected error:", err);
      setError(
        `Unerwarteter Fehler beim Speichern: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setSavingModule(false);
    }

  }

  async function handleDeleteModule(m: ContentModule) {
    const label =
      m.type === "text"
        ? "Text-Modul"
        : m.type === "pdf"
          ? "PDF-Modul"
          : "Video-Modul";

    const ok = window.confirm(`${label} „${m.title}“ wirklich löschen?`);
    if (!ok) return;

    setSavingModule(true);
    setError(null);
    setInfo(null);

    // 1) Storage-Datei löschen (nur bei pdf/video + Supabase URL)
    if ((m.type === "pdf" || m.type === "video") && m.file_url) {
      const parsed = parseSupabaseStorageObject(m.file_url);

      if (parsed) {
        const { error: storageError } = await supabase.storage
          .from(parsed.bucket)
          .remove([parsed.path]);

        if (storageError) {
          console.error("Storage delete failed:", storageError);
          setError(
            `Datei konnte nicht aus Storage gelöscht werden: ${
              storageError.message ?? "unknown error"
            }`,
          );
          // wir versuchen trotzdem DB-Eintrag zu löschen
        }
      }
    }

    // 2) DB-Row löschen
    const { error: delError } = await supabase
      .from("content_modules")
      .delete()
      .eq("id", m.id);

    if (delError) {
      console.error("DB delete failed:", delError);
      setError(
        `DB-Eintrag konnte nicht gelöscht werden: ${
          delError.message ?? "unknown error"
        }`,
      );
      setSavingModule(false);
      return;
    }

    if (editingId === m.id) resetForm();
    await loadModules();
    setSavingModule(false);
  }

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <AdminLayout title="Admin">
      {(error || info) && (
        <div className="mb-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 mt-3">
              {info}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit module */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-emerald-950">
            {editingId ? "Modul bearbeiten" : "Neues Modul"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-emerald-900 underline"
              disabled={busy}
            >
              Bearbeiten abbrechen
            </button>
          )}
        </div>

        <form onSubmit={handleSaveModule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center">
            <label className="text-emerald-900 font-semibold">Typ</label>
            <div className="md:col-span-2">
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
              >
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center">
            <label className="text-emerald-900 font-semibold">Titel *</label>
            <div className="md:col-span-2">
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-start">
            <label className="text-emerald-900 font-semibold">
              Kurzname *
              <span className="block text-xs font-normal text-emerald-700">
                Wird nur intern verwendet (z. B. „behandlungsinfo“)
              </span>
            </label>
            <div className="md:col-span-2">
              <input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
                required
              />
            </div>
          </div>

          {/* ✅ Text-Modul: Markdown Editor */}
          {form.type === "text" && (
            <div className="grid grid-cols-1 gap-3">
              <label className="text-emerald-900 font-semibold">
                Textinhalt
              </label>

              {loadingEdit && (
                <div className="text-sm text-emerald-800">Lade Inhalt…</div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <MdxTextEditor
                  value={draftBody}
                  onChange={(v) => {
                    setDraftBody(v);
                    setField("body_md", v);
                  }}
                />
              </div>
            </div>
          )}

          {(form.type === "pdf" || form.type === "video") && (
            <div className="grid grid-cols-1 gap-3">
              <label className="text-emerald-900 font-semibold">
                {form.type === "pdf" ? "PDF" : "Video"} (Upload oder URL)
              </label>

              <input
                type="file"
                accept={form.type === "pdf" ? "application/pdf" : "video/*"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFileUpload(f);
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                disabled={busy}
              />

              {uploading && (
                <div className="text-sm text-emerald-800">Upload läuft…</div>
              )}
              {uploadError && (
                <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {uploadError}
                </div>
              )}

              <input
                type="url"
                value={form.file_url}
                onChange={(e) => setField("file_url", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder="oder URL einfügen…"
                disabled={busy}
              />
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 rounded-full text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingModule
                ? "Speichere…"
                : editingId
                  ? "Änderungen speichern"
                  : "Modul anlegen"}
            </button>

            <button
              type="button"
              onClick={() => void loadModules()}
              className="text-emerald-900 underline"
              disabled={busy}
            >
              Aktualisieren
            </button>

            {!editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-emerald-900 underline"
                disabled={busy}
              >
                Formular leeren
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List modules */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-950">
            Bestehende Module
          </h2>
          <button
            onClick={() => void loadModules()}
            className="text-emerald-900 underline"
            disabled={busy}
          >
            Aktualisieren
          </button>
        </div>

        {loadingModules ? (
          <div className="text-emerald-900">Lade…</div>
        ) : modules.length === 0 ? (
          <div className="text-emerald-900">Noch keine Module vorhanden.</div>
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Titel
                  </th>
                  <th className="text-left px-4 py-3 text-emerald-950">Slug</th>
                  <th className="text-left px-4 py-3 text-emerald-950">Typ</th>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-emerald-950">{m.title}</td>
                    <td className="px-4 py-3 text-emerald-800">{m.slug}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs text-emerald-900">
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-800">{m.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => void startEdit(m)}
                          className="text-emerald-900 underline"
                          disabled={busy}
                        >
                          Bearbeiten
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteModule(m)}
                          className="text-rose-700 underline"
                          disabled={busy}
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
