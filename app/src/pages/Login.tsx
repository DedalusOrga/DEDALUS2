import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error)
      setMessage("Login fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.");
    else navigate("/home");

    setLoading(false);
  }

  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) return alert("Bitte E-Mail eintragen.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    if (error) alert(error.message);
    else alert("Wenn die E-Mail existiert, wurde ein Reset-Link gesendet.");
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded w-full p-2"
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded w-full p-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded mt-2"
        >
          {loading ? "Bitte warten…" : "Einloggen"}
        </button>
      </form>

      {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}

      <div className="mt-2 text-right">
        <a
          href="#"
          onClick={handleForgotPassword}
          className="text-sm underline text-gray-600"
        >
          Passwort vergessen?
        </a>
      </div>

      {/* 👇 Neuer Registrierungs-Button */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Noch kein Konto?</p>
        <Link
          to="/register"
          className="inline-block w-full bg-green-600 hover:bg-green-700 text-white rounded py-2 transition-colors"
        >
          Jetzt registrieren
        </Link>
      </div>
    </div>
  );
}
