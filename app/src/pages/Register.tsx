import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

  function validatePassword(pw: string): string | null {
    if (pw.length < 12)
      return "Das Passwort muss mindestens 12 Zeichen lang sein.";
    if (!/[A-Z]/.test(pw))
      return "Das Passwort muss mindestens einen Großbuchstaben enthalten.";
    if (!/[a-z]/.test(pw))
      return "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.";
    if (!/[0-9]/.test(pw))
      return "Das Passwort muss mindestens eine Zahl enthalten.";
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=~]/.test(pw))
      return "Das Passwort muss mindestens ein Sonderzeichen enthalten.";
    return null;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMsg(passwordError);
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.log("Supabase Signup Error:", error);
      setMsg(
        "Registrierung nicht möglich. Bitte prüfen Sie Ihre Zugangsberechtigung oder wenden Sie sich an den Studienleiter."
      );
      setBusy(false);
      return;
    }

    setMsg("Konto erstellt! Bitte jetzt einloggen …");
    setTimeout(() => navigate("/login"), 1200);
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">Registrieren</h1>
      <form onSubmit={handleSignup} className="space-y-3">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2 rounded bg-green-600 text-white"
        >
          {busy ? "Bitte warten …" : "Registrieren"}
        </button>
      </form>

            {/* Überschrift */}
            <h1 className="text-6xl md:text-5xl font-bold text-green-900 mb-4">
                Willkommen zur DEDALUS 2
            </h1>

            {/* Unterüberschrift */}
            <p className=" text-2xl font-bold  text-[#0D1B2A] mb-8">
                Erstellen Sie ein Konto, um fortzufahren.
            </p>

            <form  onSubmit={handleSignup}  className="w-full max-w-sm space-y-3">
                {/* Name */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Name</label>
                    <input
                        type="text"
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                    />
                </div>

                {/* E-Mail */}
                <div  className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">E-Mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                        required
                    />
                </div>

                {/* Passwort */}
                <div  className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Passwort</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                        required
                    />
                </div>

                {/* Passwort bestätigen */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Passwort bestätigen</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                        required
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-[#0D3B2E] text-white font-bold py-3 rounded-full mt-4"
                >
                    {busy ? "Lädt…" : "Registrieren"}
                </button>
            </form>
            {msg && (
                <p className="mt-4 text-lg font-semibold text-red-600">
                    {msg}
                </p>
            )}

            {/* Unterer Text */}
            <p className="mt-6 font-bold text-[#0D1B2A]">
                Sie haben bereits ein Konto?{" "}
                <Link to="/login" className="text-green-600 font-bold">
                    Anmelden
                </Link>
            </p>
        </div>
    );
}