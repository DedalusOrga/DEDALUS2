// src/pages/ForgotPassword.tsx
import { useEffect, useState } from "react";
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

    const base = import.meta.env.BASE_URL ?? "/";
    const redirectTo = new URL(
      `${base}auth/reset`,
      window.location.origin,
    ).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    setMsg(
      "Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
    );
  }

  return (
    <div className="min-h-screen border border-blue-300 bg-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl px-6 py-12 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0D3B2E] mb-4">
          Passwort zurücksetzen
        </h1>

        <p className="text-lg md:text-xl font-semibold text-[#0D1B2A] mb-8">
          Bitte geben Sie Ihre E-Mail ein.
        </p>

        {msg && <p className="text-sm font-medium text-red-600 mb-4">{msg}</p>}

        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm mx-auto space-y-4 text-left"
        >
          <div className="flex flex-col w-full">
            <label className="mb-1 font-semibold text-[#0D1B2A]">E-Mail</label>
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#335F50] rounded-full px-4 py-3 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-[#335F50]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="_slsk3 w-full bg-[#0D3B2E] text-white font-semibold py-3 rounded-full mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Bitte warten…" : "Reset-Link senden"}
          </button>
        </form>

        <p className="mt-8 font-semibold text-[#0D1B2A]">
          Zurück zum{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#1EAD5A] font-semibold underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
