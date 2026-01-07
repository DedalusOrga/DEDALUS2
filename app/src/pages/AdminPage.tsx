import React, { useEffect, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";

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

// Bucket je nach Modultyp auswählen
function getBucketForType(type: "text" | "pdf" | "video") {
  if (type === "pdf") return "PDF";
  if (type === "video") return "videos";
  // für Text wird kein Storage verwendet – Fallback, falls nötig
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

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewModuleFormState>({
    type: "text",
    title: "",
    slug: "",
    body_md: "",
    file_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit-Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadModules() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("content_modules")
      .select("id, slug, title, type, body_md, file_url, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Inhalte konnten nicht geladen werden.");
    } else if (data) {
      setModules(data as ContentModule[]);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setUploadError(null);
    setForm({
      type: "text",
      title: "",
      slug: "",
      body_md: "",
      file_url: "",
    });
  }

  function startEdit(m: ContentModule) {
    setEditingId(m.id);
    setError(null);
    setUploadError(null);

    setForm({
      type: m.type,
      title: m.title,
      slug: m.slug,
      body_md: m.body_md ?? "",
      file_url: m.file_url ?? "",
    });
  }

  function handleFormChange<K extends keyof NewModuleFormState>(
    key: K,
    value: NewModuleFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Datei (PDF/Video) in Supabase Storage hochladen und URL ins Formular schreiben
  async function handleFileUpload(file: File) {
    if (form.type === "text") {
      setUploadError("Dateiupload ist nur für PDF- und Video-Module möglich.");
      return;
    }

    setUploading(true);
    setUploadError(null);

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
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        console.error("UPLOAD ERROR:", uploadErr);
        setUploadError(
          uploadErr.message ?? "Datei konnte nicht hochgeladen werden.",
        );
        return;
      }

      // Public URL holen (Bucket muss public sein, sonst brauchst du signed URLs zur Laufzeit)
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setForm((prev) => ({ ...prev, file_url: data.publicUrl }));
    } finally {
      setUploading(false);
    }
  }

  // Create oder Update
  async function handleSaveModule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!form.title || !form.slug) {
      setError("Titel und Kurzname sind Pflichtfelder.");
      setSaving(false);
      return;
    }

    const normalizedSlug = form.slug.trim().toLowerCase().replace(/\s+/g, "-");

    const payload: ContentModulePayload = {
      title: form.title,
      slug: normalizedSlug,
      type: form.type,
      status: "published",
      body_md: null,
      file_url: null,
    };

    if (form.type === "text") {
      payload.body_md = form.body_md || "";
    } else {
      payload.file_url = form.file_url || "";
    }

    if (editingId) {
      const { error } = await supabase
        .from("content_modules")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        setError("Modul konnte nicht aktualisiert werden.");
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("content_modules")
        .insert([payload]);

      if (error) {
        console.error(error);
        setError("Neues Modul konnte nicht gespeichert werden.");
        setSaving(false);
        return;
      }
    }

    resetForm();
    await loadModules();
    setSaving(false);
  }

  // ✅ Löschen für Text/PDF/Video:
  // - Text: nur DB
  // - PDF/Video: best effort Storage entfernen (wenn file_url Supabase-Storage URL), dann DB
  async function handleDeleteModule(m: ContentModule) {
    const label =
      m.type === "text"
        ? "Text-Modul"
        : m.type === "pdf"
          ? "PDF-Modul"
          : "Video-Modul";

    const ok = window.confirm(`${label} „${m.title}“ wirklich löschen?`);
    if (!ok) return;

    setSaving(true);
    setError(null);

    // 1) Storage-Datei löschen (nur bei pdf/video + Supabase URL)
    if ((m.type === "pdf" || m.type === "video") && m.file_url) {
      const parsed = parseSupabaseStorageObject(m.file_url);

      if (parsed) {
        const { error: storageError } = await supabase.storage
          .from(parsed.bucket)
          .remove([parsed.path]);

        if (storageError) {
          // Jetzt NICHT nur warnen, sondern anzeigen:
          console.error("Storage delete failed:", storageError);
          setError(
            `Datei konnte nicht aus Storage gelöscht werden: ${storageError.message ?? "unknown error"}`,
          );
          // Wir versuchen trotzdem, den DB-Eintrag zu löschen
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
        `DB-Eintrag konnte nicht gelöscht werden: ${delError.message ?? "unknown error"}`,
      );
      setSaving(false);
      return;
    }

    if (editingId === m.id) resetForm();
    await loadModules();
    setSaving(false);
  }

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header: Zurück + Titel + Logout */}
      <header className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/home")}
          className="text-sm underline text-gray-700"
        >
          Zurück
        </button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-semibold">Adminbereich – Inhalte</h1>
          <p className="text-xs text-gray-500">
            Angemeldet als {user?.email ?? "Unbekannt"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm underline text-red-600"
        >
          Logout
        </button>
      </header>

      {/* Fehlermeldung */}
      {error && (
        <div className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Neues Modul anlegen / Bearbeiten */}
      <section className="p-4 border rounded-xl bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {editingId ? "Modul bearbeiten" : "Neues Modul anlegen"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm underline text-gray-600"
            >
              Bearbeiten abbrechen
            </button>
          )}
        </div>

        <form onSubmit={handleSaveModule} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium w-full sm:w-1/3">Typ</label>
            <select
              value={form.type}
              onChange={(e) =>
                handleFormChange(
                  "type",
                  e.target.value as "text" | "pdf" | "video",
                )
              }
              className="border rounded px-2 py-1 w-full sm:w-2/3"
            >
              <option value="text">Text</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium w-full sm:w-1/3">
              Titel *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              className="border rounded px-2 py-1 w-full sm:w-2/3"
              placeholder="z. B. Behandlungsinformation"
              required
            />
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
            <label className="text-sm font-medium w-full sm:w-1/3">
              Kurzname für das Modul *
              <span className="block text-xs font-normal text-gray-500">
                Wird nur technisch im System verwendet (z. B. „behandlungsinfo“)
              </span>
            </label>

            <div className="w-full sm:w-2/3">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleFormChange("slug", e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="z. B. behandlungsinfo"
                required
              />
            </div>
          </div>
          {form.type === "text" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Textinhalt</label>
              <textarea
                value={form.body_md}
                onChange={(e) => handleFormChange("body_md", e.target.value)}
                className="border rounded px-2 py-1 w-full"
                rows={4}
                placeholder="Text, der im Frontend angezeigt werden soll…"
              />
            </div>
          )}
          {(form.type === "pdf" || form.type === "video") && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                {form.type === "pdf"
                  ? "PDF-Datei oder URL"
                  : "Video-Datei oder URL"}
              </label>

              {/* Upload in Supabase Storage */}
              <input
                type="file"
                accept={form.type === "pdf" ? "application/pdf" : "video/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleFileUpload(file);
                  }
                }}
                className="border rounded px-2 py-1 w-full"
              />

              {uploading && (
                <p className="text-xs text-gray-500">Datei wird hochgeladen…</p>
              )}
              {uploadError && (
                <p className="text-xs text-red-600">{uploadError}</p>
              )}

              {/* URL anzeigen / manuell überschreiben */}
              <input
                type="url"
                value={form.file_url}
                onChange={(e) => handleFormChange("file_url", e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder={
                  form.type === "pdf"
                    ? "Direkte PDF-URL (oder wird nach Upload automatisch gesetzt)"
                    : "Direkte Video-URL (oder wird nach Upload automatisch gesetzt)"
                }
              />
            </div>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
            >
              {saving
                ? "Speichere…"
                : editingId
                  ? "Änderungen speichern"
                  : "Modul anlegen"}
            </button>

            {!editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm underline text-gray-600"
              >
                Formular leeren
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Modul-Übersicht */}
      <section className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bestehende Module</h2>
          <button
            onClick={() => void loadModules()}
            className="text-sm underline text-gray-600"
          >
            Aktualisieren
          </button>
        </div>

        {loading ? (
          <div>Inhalte werden geladen…</div>
        ) : modules.length === 0 ? (
          <div className="text-sm text-gray-600">
            Es sind noch keine Module vorhanden.
          </div>
        ) : (
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-3 py-2">Titel</th>
                  <th className="text-left px-3 py-2">Slug</th>
                  <th className="text-left px-3 py-2">Typ</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="px-3 py-2">{m.title}</td>
                    <td className="px-3 py-2 text-gray-600">{m.slug}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {m.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{m.status}</td>

                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {m.type === "text" && (
                          <button
                            type="button"
                            onClick={() => startEdit(m)}
                            className="text-sm underline text-blue-700"
                            disabled={saving}
                          >
                            Bearbeiten
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            console.log(
                              "[UI] Delete button clicked",
                              m.id,
                              m.type,
                              m.file_url,
                            );
                            void handleDeleteModule(m);
                          }}
                          className="text-sm underline text-red-600"
                          disabled={saving}
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
      </section>
    </div>
  );
}
