// src/pages/ForgotPassword.tsx
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const prefill = params.get("email");
    if (prefill) setEmail(prefill);
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    setLoading(false);

    if (error) return setMsg(error.message);
    // freundliche Erfolgsmeldung + Option zurück zum Login
    setMsg(
      "Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet."
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Passwort zurücksetzen
      </h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded w-full p-2"
          required
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded mt-2"
        >
          {loading ? "Bitte warten…" : "Reset-Link senden"}
        </button>
      </form>

      {msg && <p className="text-sm text-gray-700 mt-3">{msg}</p>}

      <button
        onClick={() => navigate("/login")}
        className="mt-6 underline text-sm text-gray-600"
      >
        Zurück zum Login
      </button>
    </div>
  );
}
