import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/supabase/client";
import { useAuth } from "../../hooks/AuthProvider";
import AdminLayout from "../../components/AdminLayout";
import MdxTextEditor from "../../components/MdxTextEditor";

type ContentModule = {
  id: string;
  slug: string;
  title: string;
  type: "text" | "pdf" | "video";
  body_md?: string | null;
  body_md_simple?: string | null;

  audio_url?: string | null;
  audio_simple_url?: string | null;

  file_url?: string | null;
  status: string;
};

type NewModuleFormState = {
  type: "text" | "pdf" | "video";
  title: string;
  slug: string;

  body_md: string;
  body_md_simple: string;

  audio_url: string;
  audio_simple_url: string;

  file_url: string;
};

type ContentModulePayload = {
  title: string;
  slug: string;
  type: "text" | "pdf" | "video";
  status: string;

  body_md: string | null;
  body_md_simple: string | null;

  audio_url: string | null;
  audio_simple_url: string | null;

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

async function tryDeleteStorageObjectFromUrl(fileUrl: string) {
  const parsed = parseSupabaseStorageObject(fileUrl);
  if (!parsed)
    return { ok: false as const, reason: "not-supabase-url" as const };

  const { error } = await supabase.storage
    .from(parsed.bucket)
    .remove([parsed.path]);
  if (error)
    return { ok: false as const, reason: "delete-failed" as const, error };

  return { ok: true as const };
}

const normText = (s: string | null | undefined) =>
  (s ?? "").replace(/\r\n/g, "\n").trimEnd();

function normalizeSlug(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "-");
}

function safeNameFromSlug(rawSlug: string) {
  return (rawSlug.trim() || "module")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

export default function AdminPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isQuestions = location.pathname.startsWith("/admin/questions");
  const isRouting = location.pathname.startsWith("/admin/decision-trees");
  const isContent = !isQuestions && !isRouting;

  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const [savingModule, setSavingModule] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // ✅ Standard: immer Text (Video wird über file_url zusätzlich gepflegt)
  const [form, setForm] = useState<NewModuleFormState>({
    type: "text",
    title: "",
    slug: "",

    body_md: "",
    body_md_simple: "",

    audio_url: "",
    audio_simple_url: "",

    file_url: "",
  });

  const [activeVariant, setActiveVariant] = useState<
    "video" | "text_normal" | "text_simple" | "audio_normal" | "audio_simple"
  >("video");

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const editReqRef = useRef(0);
  const [editorNonce, setEditorNonce] = useState(0);

  const busy = savingModule || uploading || loadingEdit;

  const [search, setSearch] = useState("");

  const DRAFT_KEY = "dedalus.admin.content.draft.v1";

  function hasDraftData(f: NewModuleFormState) {
    return Boolean(
      f.title.trim() ||
      f.slug.trim() ||
      f.body_md.trim() ||
      f.body_md_simple.trim() ||
      (f.audio_url ?? "").trim() ||
      (f.audio_simple_url ?? "").trim() ||
      (f.file_url ?? "").trim(),
    );
  }

  // ✅ Scroll-to-top beim Bearbeiten (ist schon drin)
  const formTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        form?: Partial<NewModuleFormState>;
        activeVariant?: string;
        editingId?: string | null;
      };

      if (!parsed.form) return;
      if (editingId) return;
      if (hasDraftData(form)) return;

      setForm((prev) => ({
        ...prev,
        ...parsed.form,
      }));

      const allowedVariants = new Set([
        "video",
        "text_normal",
        "text_simple",
        "audio_normal",
        "audio_simple",
      ]);

      if (parsed.activeVariant && allowedVariants.has(parsed.activeVariant)) {
        setActiveVariant(parsed.activeVariant as typeof activeVariant);
      }

      setInfo("Entwurf wiederhergestellt.");
    } catch {
      // Ignoriere kaputte Drafts.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasDraftData(form)) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            form,
            activeVariant,
            editingId,
          }),
        );
      } catch {
        // LocalStorage kann voll sein; dann still abbrechen.
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [form, activeVariant, editingId]);

  async function loadModules() {
    setLoadingModules(true);
    setError(null);

    const { data, error } = await supabase
      .from("content_modules")
      .select(
        "id, slug, title, type, body_md, body_md_simple, audio_url, audio_simple_url, file_url, status",
      )
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
    editReqRef.current++;

    setEditingId(null);
    setUploadError(null);
    setError(null);
    setInfo(null);
    localStorage.removeItem(DRAFT_KEY);

    setForm({
      type: "text",
      title: "",
      slug: "",

      body_md: "",
      body_md_simple: "",

      audio_url: "",
      audio_simple_url: "",

      file_url: "",
    });

    setActiveVariant("text_normal");
    setEditorNonce((n) => n + 1);
  }

  async function startEdit(m: ContentModule) {
    setError(null);
    setInfo(null);
    setUploadError(null);
    setLoadingEdit(true);

    const reqId = ++editReqRef.current;

    const fresh = await supabase
      .from("content_modules")
      .select(
        "id, slug, title, type, body_md, body_md_simple, audio_url, audio_simple_url, file_url, status",
      )
      .eq("id", m.id)
      .single();

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

    setForm({
      type: "text",
      title: row.title,
      slug: row.slug,

      body_md: row.body_md ?? "",
      body_md_simple: row.body_md_simple ?? "",

      audio_url: row.audio_url ?? "",
      audio_simple_url: row.audio_simple_url ?? "",

      file_url: row.file_url ?? "",
    });

    setActiveVariant("text_normal");
    setEditingId(row.id);
    setEditorNonce((n) => n + 1);

    // ✅ beim Bearbeiten nach oben
    requestAnimationFrame(() => {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function setField<K extends keyof NewModuleFormState>(
    key: K,
    value: NewModuleFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFileUpload(file: File) {
    // file_url ist bei uns ausschließlich für Video gedacht
    const isMp4 =
      file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");

    if (!isMp4) {
      setUploadError("Bitte nur MP4 hochladen.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setError(null);
    setInfo(null);

    try {
      // ✅ Replace: altes Video löschen (wenn vorhanden)
      if (form.file_url.trim()) {
        const del = await tryDeleteStorageObjectFromUrl(form.file_url.trim());
        if (!del.ok && del.reason !== "not-supabase-url") {
          console.warn("Old video delete failed:", del.error);
          // nicht abbrechen – neues Video darf trotzdem hochladen
        }
      }

      const ext = file.name.split(".").pop() ?? "mp4";
      const safeSlug = safeNameFromSlug(form.slug);
      const filePath = `modules/${Date.now()}_${safeSlug}.${ext}`;
      const bucket = "videos";

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadErr) {
        console.error("UPLOAD ERROR:", uploadErr);
        setUploadError(
          uploadErr.message ?? "Video konnte nicht hochgeladen werden.",
        );
        return;
      }

      const TEN_YEARS = 60 * 60 * 24 * 365 * 10; // 10 Jahre

      const signed = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, TEN_YEARS);

      if (signed.error || !signed.data?.signedUrl) {
        console.error("SIGNED URL ERROR:", signed.error);
        setUploadError(
          signed.error?.message ??
            "Signed URL konnte nicht erstellt werden (Bucket/Policy prüfen).",
        );
        return;
      }

      setForm((prev) => ({ ...prev, file_url: signed.data!.signedUrl }));
      setInfo("Video erfolgreich hochgeladen (Signed URL – 10 Jahre gültig).");
    } finally {
      setUploading(false);
    }
  }

  async function handleAudioUpload(file: File, variant: "normal" | "simple") {
    const isMp3 =
      file.type === "audio/mpeg" ||
      file.name.toLowerCase().endsWith(".mp3") ||
      file.name.toLowerCase().endsWith(".mpeg");
    if (!isMp3) {
      setUploadError("Bitte eine MP3-Datei hochladen.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setError(null);
    setInfo(null);

    try {
      // ✅ Replace: altes Audio löschen (wenn vorhanden)
      const currentUrl =
        variant === "normal"
          ? form.audio_url.trim()
          : form.audio_simple_url.trim();

      if (currentUrl) {
        const del = await tryDeleteStorageObjectFromUrl(currentUrl);
        if (!del.ok && del.reason !== "not-supabase-url") {
          console.warn("Old audio delete failed:", del.error);
        }
      }

      const safeSlug = safeNameFromSlug(form.slug);
      const folder = variant === "normal" ? "original" : "simple";
      const path = `${folder}/${Date.now()}_${safeSlug}.mp3`;
      const bucket = "audio";

      const up = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (up.error) {
        console.error("AUDIO UPLOAD ERROR:", up.error);
        setUploadError(
          up.error.message ?? "Audio konnte nicht hochgeladen werden.",
        );
        return;
      }

      // ✅ auch Audio: 10 Jahre
      const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

      const signed = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, TEN_YEARS);

      if (signed.error || !signed.data?.signedUrl) {
        console.error("SIGNED URL ERROR:", signed.error);
        setUploadError(
          signed.error?.message ??
            "Signed URL konnte nicht erstellt werden (Bucket/Policy prüfen).",
        );
        return;
      }

      if (variant === "normal") setField("audio_url", signed.data.signedUrl);
      else setField("audio_simple_url", signed.data.signedUrl);

      setInfo("Audio erfolgreich hochgeladen (Signed URL – 10 Jahre).");
    } finally {
      setUploading(false);
    }
  }
  async function handleClearVideo() {
    const url = form.file_url.trim();
    if (!url) return;

    setUploading(true);
    setUploadError(null);
    setError(null);
    setInfo(null);

    try {
      // ✅ wenn wir editieren: DB sofort leeren (damit kein toter Link stehen bleibt)
      if (editingId) {
        const { error: dbErr } = await supabase
          .from("content_modules")
          .update({ file_url: null })
          .eq("id", editingId);

        if (dbErr) {
          setUploadError(
            dbErr.message ?? "DB konnte nicht aktualisiert werden.",
          );
          return;
        }

        setField("file_url", "");
        await loadModules();
        setInfo("Video wurde entfernt.");
      } else {
        // Neues Modul (noch nicht gespeichert): nur lokal leeren
        setField("file_url", "");
        setInfo("Video wurde entfernt.");
      }

      // ✅ Danach: Storage-Datei löschen (best effort)
      const del = await tryDeleteStorageObjectFromUrl(url);
      if (!del.ok && del.reason !== "not-supabase-url") {
        console.warn("Video storage delete failed:", del.error);
        // nicht als harter Fehler – DB ist schon korrekt
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleClearAudio(variant: "normal" | "simple") {
    const url = (
      variant === "normal" ? form.audio_url : form.audio_simple_url
    ).trim();
    if (!url) return;

    setUploading(true);
    setUploadError(null);
    setError(null);
    setInfo(null);

    try {
      const dbField = variant === "normal" ? "audio_url" : "audio_simple_url";

      // ✅ wenn wir editieren: DB sofort leeren
      if (editingId) {
        const { error: dbErr } = await supabase
          .from("content_modules")
          .update({ [dbField]: null } as any)
          .eq("id", editingId);

        if (dbErr) {
          setUploadError(
            dbErr.message ?? "DB konnte nicht aktualisiert werden.",
          );
          return;
        }

        if (variant === "normal") setField("audio_url", "");
        else setField("audio_simple_url", "");

        await loadModules();
        setInfo("Audio wurde entfernt.");
      } else {
        // Neues Modul (noch nicht gespeichert): nur lokal leeren
        if (variant === "normal") setField("audio_url", "");
        else setField("audio_simple_url", "");
        setInfo("Audio wurde entfernt.");
      }

      // ✅ Danach: Storage-Datei löschen (best effort)
      const del = await tryDeleteStorageObjectFromUrl(url);
      if (!del.ok && del.reason !== "not-supabase-url") {
        console.warn("Audio storage delete failed:", del.error);
      }
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

      const normalizedSlug = normalizeSlug(slug);

      const payload: ContentModulePayload = {
        title,
        slug: normalizedSlug,
        type: "text",
        status: "published",

        body_md: normText(form.body_md),
        body_md_simple: (() => {
          const s = normText(form.body_md_simple);
          return s.length ? s : null;
        })(),

        audio_url: (() => {
          const s = (form.audio_url ?? "").trim();
          return s.length ? s : null;
        })(),
        audio_simple_url: (() => {
          const s = (form.audio_simple_url ?? "").trim();
          return s.length ? s : null;
        })(),

        // file_url bleibt bei uns ausschließlich Video
        file_url: (() => {
          const s = (form.file_url ?? "").trim();
          return s.length ? s : null;
        })(),
      };

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
        .select(
          "id, slug, title, type, body_md, body_md_simple, audio_url, audio_simple_url, file_url, status, updated_at",
        )
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
    const ok = window.confirm(`Modul „${m.title}“ wirklich löschen?`);
    if (!ok) return;

    setSavingModule(true);
    setError(null);
    setInfo(null);

    const urlsToTry: string[] = [];
    if (m.file_url) urlsToTry.push(m.file_url);
    if (m.audio_url) urlsToTry.push(m.audio_url);
    if (m.audio_simple_url) urlsToTry.push(m.audio_simple_url);

    for (const u of urlsToTry) {
      const parsed = parseSupabaseStorageObject(u);
      if (!parsed) continue;

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
      }
    }

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

  const filteredModules = modules.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const title = (m.title ?? "").toLowerCase();
    const slug = (m.slug ?? "").toLowerCase();

    return title.includes(q) || slug.includes(q);
  });

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
      <div ref={formTopRef} className="bg-white rounded-3xl shadow-sm p-6 mb-6">
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
            <label className="text-emerald-900 font-semibold">Titel *</label>
            <div className="md:col-span-2">
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                onBlur={() => {
                  if (!form.slug.trim() && form.title.trim()) {
                    setField("slug", normalizeSlug(form.title));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
                required
              />
            </div>
          </div>

          {/* ✅ Text-Modul: 4 Tabs + Editor/Audio */}
          {form.type === "text" && (
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-end justify-between gap-3">
                <label className="text-emerald-900 font-semibold">
                  Inhalte (Text & Audio)
                </label>

                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 flex-wrap gap-1">
                  {[
                    ["text_normal", "Originaltext"],
                    ["text_simple", "Vereinfachter Text"],
                    ["audio_normal", "Audio (Original)"],
                    ["audio_simple", "Audio (Vereinfacht)"],
                    ["video", "Video"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setActiveVariant(key as typeof activeVariant)
                      }
                      className={
                        "px-3 py-1.5 text-sm rounded-full transition " +
                        (activeVariant === key
                          ? "bg-white shadow-sm text-emerald-950"
                          : "text-emerald-800 hover:bg-white/60")
                      }
                      disabled={busy}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingEdit && (
                <div className="text-sm text-emerald-800">Lade Inhalt…</div>
              )}

              {/* VIDEO */}
              {activeVariant === "video" && (
                <div className="grid gap-3">
                  <div className="text-xs text-emerald-800">
                    Hier bitte das <b>Video</b> einfügen
                  </div>

                  <input
                    type="file"
                    accept="video/mp4,.mp4"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleFileUpload(f);
                      // erlaubt, dieselbe Datei erneut zu wählen
                      e.currentTarget.value = "";
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                    disabled={busy || !form.slug.trim()}
                  />

                  {uploading && (
                    <div className="text-sm text-emerald-800">
                      Upload läuft…
                    </div>
                  )}
                  {uploadError && (
                    <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                      {uploadError}
                    </div>
                  )}

                  {form.file_url && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleClearVideo()}
                        className="text-rose-700 underline"
                        disabled={busy}
                      >
                        Video löschen
                      </button>
                      <span className="text-xs text-emerald-700">
                        Video ist hinterlegt. Beim nächsten Upload wird es
                        automatisch ersetzt.
                      </span>
                    </div>
                  )}

                  {!!form.file_url && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <video
                        controls
                        src={form.file_url}
                        className="w-full rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TEXT: Original */}
              {activeVariant === "text_normal" && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <MdxTextEditor
                    key={`${editingId ?? "new"}:text_normal:${editorNonce}`}
                    value={form.body_md}
                    onChange={(v) => setField("body_md", v)}
                  />
                </div>
              )}

              {/* TEXT: Simplified */}
              {activeVariant === "text_simple" && (
                <>
                  <div className="text-xs text-emerald-800">
                    Wird angezeigt, wenn Nutzer:innen auf <b>„Vereinfachen“</b>{" "}
                    klicken. Wenn leer, nutzt das Frontend automatisch den
                    Originaltext.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <MdxTextEditor
                      key={`${editingId ?? "new"}:text_simple:${editorNonce}`}
                      value={form.body_md_simple}
                      onChange={(v) => setField("body_md_simple", v)}
                    />
                  </div>
                </>
              )}

              {/* AUDIO: Original */}
              {activeVariant === "audio_normal" && (
                <div className="grid gap-3">
                  <div className="text-xs text-emerald-800">
                    MP3 für den <b>Originaltext</b>.
                  </div>

                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleAudioUpload(f, "normal");
                      e.currentTarget.value = "";
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                    disabled={busy}
                  />

                  {uploading && (
                    <div className="text-sm text-emerald-800">
                      Upload läuft…
                    </div>
                  )}
                  {uploadError && (
                    <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                      {uploadError}
                    </div>
                  )}

                  {form.audio_url && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleClearAudio("normal")}
                        className="text-rose-700 underline"
                        disabled={busy}
                      >
                        Audio (Original) löschen
                      </button>
                      <span className="text-xs text-emerald-700">
                        Audio ist hinterlegt. Beim nächsten Upload wird es
                        automatisch ersetzt.
                      </span>
                    </div>
                  )}

                  {form.audio_url && (
                    <audio controls src={form.audio_url} className="w-full" />
                  )}
                </div>
              )}

              {/* AUDIO: Simplified */}
              {activeVariant === "audio_simple" && (
                <div className="grid gap-3">
                  <div className="text-xs text-emerald-800">
                    MP3 für den <b>vereinfachten Text</b>.
                  </div>

                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,.mp3"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleAudioUpload(f, "simple");
                      e.currentTarget.value = "";
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                    disabled={busy}
                  />

                  {uploading && (
                    <div className="text-sm text-emerald-800">
                      Upload läuft…
                    </div>
                  )}
                  {uploadError && (
                    <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                      {uploadError}
                    </div>
                  )}

                  {form.audio_simple_url && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void handleClearAudio("simple")}
                        className="text-rose-700 underline"
                        disabled={busy}
                      >
                        Audio (Vereinfacht) löschen
                      </button>
                      <span className="text-xs text-emerald-700">
                        Audio ist hinterlegt. Beim nächsten Upload wird es
                        automatisch ersetzt.
                      </span>
                    </div>
                  )}

                  {form.audio_simple_url && (
                    <audio
                      controls
                      src={form.audio_simple_url}
                      className="w-full"
                    />
                  )}
                </div>
              )}
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-950">
            Bestehende Module
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Titel"
              className="w-full sm:w-80 rounded-xl border border-slate-200 px-3 py-2"
              disabled={busy}
            />

            <button
              type="button"
              onClick={() => void loadModules()}
              className="text-emerald-900 underline"
              disabled={busy}
            >
              Aktualisieren
            </button>
          </div>
        </div>

        {loadingModules ? (
          <div className="text-emerald-900">Lade…</div>
        ) : filteredModules.length === 0 ? (
          <div className="text-emerald-900">
            {search.trim()
              ? "Keine Module passen zur Suche."
              : "Noch keine Module vorhanden."}
          </div>
        ) : (
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Titel
                  </th>

                  <th className="text-left px-4 py-3 text-emerald-950">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Aktionen
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredModules.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-emerald-950">{m.title}</td>

                    <td className="px-4 py-3 text-emerald-800">{m.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void startEdit(m)}
                          disabled={busy}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Bearbeiten
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDeleteModule(m)}
                          disabled={busy}
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
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
