import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  // Optional: prüfen, ob ein Recovery-Event da ist (nicht zwingend nötig)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Token ist gesetzt – Formular anzeigen
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else {
      setMsg("Passwort aktualisiert. Bitte neu einloggen.");
      setTimeout(() => navigate("/login"), 1200);
    }
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Neues Passwort setzen</h1>
      <form onSubmit={handleUpdate} className="space-y-3">
        <input
          type="password"
          placeholder="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded bg-blue-600 text-white"
        >
          {busy ? "Speichere…" : "Passwort speichern"}
        </button>
      </form>
      {msg && <p className="text-sm text-gray-600 mt-3">{msg}</p>}
    </div>
  );
}
