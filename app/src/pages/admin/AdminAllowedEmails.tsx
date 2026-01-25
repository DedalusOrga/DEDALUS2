import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { supabase } from "../../infrastructure/supabase/client";

async function setAdminByEmail(email: string, makeAdmin: boolean) {
  const { error } = await supabase.rpc("set_admin_by_email", {
    target_email: email,
    make_admin: makeAdmin,
  });
  if (error) throw new Error(error.message);
}

type AllowedEmailRow = {
  email: string;
  registered?: boolean;
  is_admin?: boolean | null;
};

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export default function AdminAllowedEmails() {
  const TABLE = "allowed_emails";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AllowedEmailRow[]>([]);

  const [newEmail, setNewEmail] = useState("");

  const q = useMemo(() => query.trim().toLowerCase(), [query]);

  async function loadRows() {
    setLoading(true);
    setError(null);

    let req = supabase
      .from(TABLE)
      .select("email")
      .order("email", { ascending: true })
      .limit(2000);

    if (q.length >= 2) {
      req = req.ilike("email", `%${q}%`);
    }

    const { data, error } = await req;
    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const base = (data ?? []) as AllowedEmailRow[];

    // Fetch status for each email (admin-only function)
    const statusRows: AllowedEmailRow[] = await Promise.all(
      base.map(async (r) => {
        const { data: status, error: sErr } = await supabase.functions.invoke(
          "admin-get-user-status",
          { body: { email: r.email } },
        );

        if (sErr || !status) {
          // If status fetch fails, keep row but hide admin actions by leaving undefined
          return { ...r, registered: undefined, is_admin: undefined };
        }

        return {
          ...r,
          registered: !!status.registered,
          is_admin: status.is_admin ?? null,
        };
      }),
    );

    setRows(statusRows);
    setLoading(false);
  }

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadRows(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function addEmail() {
    const email = normalizeEmail(newEmail);

    if (!email) return setError("Bitte eine E-Mail eingeben.");
    if (!email.includes("@"))
      return setError("Bitte eine gültige E-Mail eingeben.");

    setSaving(true);
    setError(null);

    const { error } = await supabase.from(TABLE).insert({ email });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setNewEmail("");
    setSaving(false);
    await loadRows();
  }

  async function removeRow(row: AllowedEmailRow) {
    const ok = window.confirm(
      `Account wirklich löschen?\n\n${row.email}\n\nHinweis: Wenn der Nutzer noch nicht registriert ist, wird nur die Whitelist-E-Mail entfernt.`,
    );
    if (!ok) return;

    setSaving(true);
    setError(null);

    const { error: fnError } = await supabase.functions.invoke(
      "admin-delete-user",
      {
        body: { target_email: row.email },
      },
    );

    if (fnError) {
      const msg = (fnError as any)?.message ?? String(fnError);
      const looksLikeNotFound =
        msg.toLowerCase().includes("not found") || msg.includes("404");

      if (!looksLikeNotFound) {
        setError(msg);
        setSaving(false);
        return;
      }

      const { error: wlErr } = await supabase
        .from(TABLE)
        .delete()
        .eq("email", row.email);
      if (wlErr) {
        setError(wlErr.message);
        setSaving(false);
        return;
      }

      setSaving(false);
      await loadRows();
      alert("Nutzer war nicht registriert – Whitelist-Eintrag wurde entfernt.");
      return;
    }

    setSaving(false);
    await loadRows();
    alert("Account gelöscht.");
  }

  return (
    <AdminLayout title="Whitelist">
      {(loading || saving) && (
        <div className="mb-4 text-emerald-900">
          {loading ? "Lade…" : "Speichere…"}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-emerald-950 mb-3">
          Neue E-Mail freischalten
        </h2>

        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block font-semibold text-emerald-900 mb-2">
              E-Mail
            </label>
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="person@example.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </div>

          <button
            onClick={addEmail}
            disabled={saving}
            className="rounded-xl bg-emerald-900 text-white px-4 py-2 font-semibold hover:bg-emerald-800 disabled:opacity-60"
          >
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-emerald-950 mb-4">
          Freigeschaltete E-Mails
        </h2>

        <div className="mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        {rows.length === 0 ? (
          <div className="text-slate-600">Keine Einträge vorhanden.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((r) => {
              const statusText =
                r.registered === false
                  ? "nicht registriert"
                  : r.is_admin === true
                    ? "Admin"
                    : r.is_admin === false
                      ? "User"
                      : "Status unbekannt";

              return (
                <div
                  key={r.email}
                  className="py-4 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-950">
                      {r.email}
                    </div>
                    <div className="text-sm text-slate-600">{statusText}</div>
                  </div>

                  <div className="flex gap-3 items-center flex-wrap">
                    {/* Admin Aktionen */}
                    {r.registered === true && r.is_admin === false && (
                      <button
                        onClick={async () => {
                          try {
                            setError(null);
                            setSaving(true);
                            await setAdminByEmail(r.email, true);
                            setSaving(false);
                            await loadRows();
                          } catch (e: any) {
                            setSaving(false);
                            setError(e?.message ?? "Fehler beim Admin setzen");
                          }
                        }}
                        className="
        rounded-xl
        border border-emerald-300
        bg-emerald-50
        px-3 py-2
        text-sm font-semibold
        text-emerald-800
        hover:bg-emerald-100
        transition
      "
                      >
                        Admin setzen
                      </button>
                    )}

                    {r.registered === true && r.is_admin === true && (
                      <button
                        onClick={async () => {
                          try {
                            setError(null);
                            setSaving(true);
                            await setAdminByEmail(r.email, false);
                            setSaving(false);
                            await loadRows();
                          } catch (e: any) {
                            setSaving(false);
                            setError(
                              e?.message ?? "Fehler beim Admin entfernen",
                            );
                          }
                        }}
                        className="
        rounded-xl
        border border-amber-300
        bg-amber-50
        px-3 py-2
        text-sm font-semibold
        text-amber-800
        hover:bg-amber-100
        transition
      "
                      >
                        Admin entfernen
                      </button>
                    )}

                    {/* Trennung */}
                    <div className="mx-1 h-6 w-px bg-slate-200" />

                    {/* Löschen */}
                    <button
                      onClick={() => removeRow(r)}
                      className="
      rounded-xl
      border border-red-200
      bg-red-50
      px-3 py-2
      text-sm font-semibold
      text-red-700
      hover:bg-red-100
      transition
    "
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
