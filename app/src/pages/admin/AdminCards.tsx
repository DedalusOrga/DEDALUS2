import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../infrastructure/supabase/client";

type CardRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published" | string;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormState = {
  title: string;
  status: "draft" | "published";
  sort_order: number;
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

export default function AdminCards() {
  const [rows, setRows] = useState<CardRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: "",
    status: "draft",
    sort_order: 0,
  });

  const topRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => (r.title ?? "").toLowerCase().includes(q));
  }, [rows, search]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("cards")
      .select(
        "id,title,slug,description,status,sort_order,created_at,updated_at",
      )
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error(error);
      setError("Einträge konnten nicht geladen werden.");
      setRows([]);
    } else {
      setRows((data ?? []) as CardRow[]);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setError(null);
    setInfo(null);
    setForm({
      title: "",
      status: "draft",
      sort_order: 0,
    });
  }

  function startEdit(r: CardRow) {
    setError(null);
    setInfo(null);
    setEditingId(r.id);
    setForm({
      title: r.title ?? "",
      status: r.status === "published" ? "published" : "draft",
      sort_order: Number.isFinite(r.sort_order) ? r.sort_order : 0,
    });

    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);

    try {
      const title = form.title.trim();
      if (!title) {
        setError("Bitte einen Titel angeben.");
        return;
      }

      // ✅ slug wird IMMER automatisch aus dem Titel generiert – aber:
      // - beim Erstellen setzen
      // - beim Bearbeiten NICHT ändern (sonst brechen URLs/Bindings)
      if (editingId) {
        const upd = await supabase
          .from("cards")
          .update({
            title,
            status: form.status,
            sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
          })
          .eq("id", editingId);

        if (upd.error) {
          setError(`Speichern fehlgeschlagen: ${formatSbError(upd.error)}`);
          return;
        }

        setInfo("Eintrag gespeichert.");
        await load();
        return;
      }

      const slug = generateSlug(title);
      if (!slug) {
        setError(
          "Aus dem Titel konnte keine gültige URL erzeugt werden. Bitte Titel anpassen.",
        );
        return;
      }

      const ins = await supabase.from("cards").insert([
        {
          title,
          slug,
          // Beschreibung wird NICHT im UI gepflegt -> immer null
          description: null,
          status: form.status,
          sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
        },
      ]);

      if (ins.error) {
        const msg = formatSbError(ins.error);
        if (
          (ins.error.code === "23505" ||
            msg.toLowerCase().includes("duplicate")) &&
          msg.toLowerCase().includes("slug")
        ) {
          setError(
            "Ein Eintrag mit dieser automatisch erzeugten URL existiert bereits. Bitte Titel leicht ändern (z. B. „… (Teil 2)“).",
          );
          return;
        }

        setError(`Anlegen fehlgeschlagen: ${msg}`);
        return;
      }

      setInfo("Eintrag angelegt.");
      resetForm();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function togglePublish(r: CardRow) {
    setBusy(true);
    setError(null);
    setInfo(null);

    const next = r.status === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("cards")
      .update({ status: next })
      .eq("id", r.id);

    if (error) {
      console.error(error);
      setError(error.message ?? "Status konnte nicht geändert werden.");
      setBusy(false);
      return;
    }

    setInfo(
      next === "published"
        ? "Eintrag veröffentlicht."
        : "Eintrag auf Entwurf gesetzt.",
    );
    await load();
    setBusy(false);
  }

  async function remove(r: CardRow) {
    const ok = window.confirm(
      `Eintrag wirklich löschen?\n\n"${r.title}"\n\nAchtung: Wenn es bereits Zuordnungen über die URL gibt, verschwinden nur die Einträge aus der Übersicht – die Zuordnung in der Datenbank bleibt ggf. bestehen.`,
    );
    if (!ok) return;

    setBusy(true);
    setError(null);
    setInfo(null);

    const { error } = await supabase.from("cards").delete().eq("id", r.id);

    if (error) {
      console.error(error);
      setError(error.message ?? "Löschen fehlgeschlagen.");
      setBusy(false);
      return;
    }

    if (editingId === r.id) resetForm();
    setInfo("Eintrag gelöscht.");
    await load();
    setBusy(false);
  }

  function openPublic(r: CardRow) {
    // Patientenperspektive-Route (wie du sie im Router definiert hast)
    window.open(`/informationen/patientenperspektive/${r.slug}`, "_blank");
  }

  return (
    <AdminLayout title="Patientenperspektive – Einträge">
      {(error || info) && (
        <div className="mb-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 whitespace-pre-wrap">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 mt-3 whitespace-pre-wrap">
              {info}
            </div>
          )}
        </div>
      )}

      {(loading || busy) && (
        <div className="mb-4 text-emerald-900">
          {loading ? "Lade…" : "Speichere…"}
        </div>
      )}

      {/* Editor */}
      <div ref={topRef} className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-emerald-950">
              {editingId ? "Eintrag bearbeiten" : "Neuen Eintrag anlegen"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-emerald-900 underline disabled:opacity-60"
              disabled={busy}
            >
              Bearbeiten abbrechen
            </button>
          )}
        </div>

        <form onSubmit={save} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center">
            <label className="text-emerald-900 font-semibold">Status</label>
            <div className="md:col-span-2 flex items-center gap-3">
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value as any)}
                className="rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
              >
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
              </select>

              <label className="text-emerald-900 font-semibold ml-2">
                Reihenfolge
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setField("sort_order", Number(e.target.value))}
                className="w-28 rounded-xl border border-slate-200 px-3 py-2"
                disabled={busy}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-3 text-base font-semibold disabled:opacity-60"
            >
              {editingId ? "Änderungen speichern" : "Eintrag anlegen"}
            </button>

            {!editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-emerald-900 underline disabled:opacity-60"
                disabled={busy}
              >
                Formular leeren
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-semibold text-emerald-950">Einträge</h2>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suche nach Titel"
              className="w-full sm:w-96 rounded-xl border border-slate-200 px-3 py-2"
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => void load()}
              className="text-emerald-900 underline disabled:opacity-60"
              disabled={busy}
            >
              Aktualisieren
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-emerald-900">Lade…</div>
        ) : filtered.length === 0 ? (
          <div className="text-emerald-900">
            {search.trim()
              ? "Keine Einträge passen zur Suche."
              : "Noch keine Einträge vorhanden."}
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
                    Reihenfolge
                  </th>
                  <th className="text-left px-4 py-3 text-emerald-950">
                    Aktionen
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-emerald-950">
                      <div className="font-semibold">{r.title}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-1 text-xs font-semibold " +
                          (r.status === "published"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-100 text-slate-700")
                        }
                      >
                        {r.status === "published"
                          ? "Veröffentlicht"
                          : "Entwurf"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700">{r.sort_order}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={busy}
                        >
                          Bearbeiten
                        </button>

                        <button
                          type="button"
                          onClick={() => void togglePublish(r)}
                          className={
                            "rounded-full px-4 py-2 text-sm font-semibold border disabled:cursor-not-allowed disabled:opacity-60 " +
                            (r.status === "published"
                              ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100")
                          }
                          disabled={busy}
                        >
                          {r.status === "published"
                            ? "Depublizieren"
                            : "Veröffentlichen"}
                        </button>

                        <button
                          type="button"
                          onClick={() => void remove(r)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
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
