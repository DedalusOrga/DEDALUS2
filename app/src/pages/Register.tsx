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
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-4 text-center">
      {/* Überschrift */}
      <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-2">
        Willkommen zur DEDALUS Webapp
      </h1>

      {/* Unterüberschrift */}
      <p className="text-lg md:text-xl font-bold text-slate-900 mb-6">
        Erstellen Sie ein Konto, um fortzufahren.
      </p>

      {/* Nachricht (Fehler / Erfolg) */}
      {msg && <p className="mb-4 text-sm font-semibold text-red-600">{msg}</p>}

      {/* Formular */}
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm space-y-4 bg-emerald-50 p-6 text-left"
      >
        {/* Name – falls du ihn wirklich brauchst */}
        <div className="flex flex-col w-full">
          <label className="mb-1 font-bold text-slate-900">Name</label>
          <input
            type="text"
            className="w-full border-2 border-emerald-800 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* E-Mail */}
        <div className="flex flex-col w-full">
          <label htmlFor="email" className="mb-1 font-bold text-slate-900">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-emerald-800 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Passwort */}
        <div className="flex flex-col w-full">
          <label htmlFor="password" className="mb-1 font-bold text-slate-900">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-emerald-800 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Passwort bestätigen */}
        <div className="flex flex-col w-full">
          <label
            htmlFor="passwordConfirm"
            className="mb-1 font-bold text-slate-900"
          >
            Passwort bestätigen
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full border-2 border-emerald-800 rounded-full px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 rounded-full mt-2 transition disabled:opacity-60"
        >
          {busy ? "Lädt…" : "Registrieren"}
        </button>
      </form>

      {/* Unterer Text */}
      <p className="mt-6 font-bold text-slate-900">
        Sie haben bereits ein Konto?{" "}
        <Link to="/login" className="text-emerald-700 font-bold underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
