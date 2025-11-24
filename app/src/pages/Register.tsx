import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      {msg && <p className="text-sm text-gray-600 mt-3">{msg}</p>}

      <p className="text-sm text-center text-gray-600 mt-5">
        Bereits registriert?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Zum Login
        </Link>
      </p>
    </div>
  );
}
