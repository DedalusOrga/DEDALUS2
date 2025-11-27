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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF7E9] px-4 text-center">
            <h1 className="text-6xl md:text-5xl text-green-900 font-bold  mb-14 text-center">
                Willkommen zur DEDALUS 2
            </h1>
            <p className="text-2xl  text-black font-bold mb-1 ">
                PASSWORT ZURÜCKSETZEN.
            </p>

            <p className="text-small mb-4 text-black ">
                Wir schicken Ihnen eine Email mit Anweisung zur wiederherstellung
            </p>

            <form onSubmit={onSubmit} className="space-y-3">

                <input
                    type="email"
                    className="w-full px-4 py-2 rounded-full border-2 focus:outline-none"
                    style={{ borderColor: "#335F50" }}
                    placeholder="E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}

                    required
                    autoComplete="email"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0D3B2E] text-white font-bold px-4 py-3 rounded-full focus:outline-none"
                >
                    {loading ? "Bitte warten…" : "Reset-Link senden"}
                </button>
            </form>

            {msg && <p className="text-sm text-gray-700 mt-3">{msg}</p>}

            <button
                onClick={() => navigate("/login")}
                className="mt-6 underline text-med text-gray-600"
            >
                Zurück zum Login
            </button>
        </div>
    );
};
