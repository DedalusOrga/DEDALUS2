import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleLogin } from "../infrastructure/api/handleLogin";
import { supabase } from "../infrastructure/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await handleLogin(email, password);
    setPassword("");

    if (result.error) {
      setMessage(result.error);
    } else {
      navigate("/home");
    }

    setLoading(false);
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-4 text-center">
    {/* Titel */}
    <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-2">
      Willkommen zur DEDALUS Webapp
    </h1>

    {/* Beschreibung */}
    <p className="text-lg md:text-xl mb-8 text-gray-800 font-medium">
      Hier können Sie sich sicher anmelden.
    </p>

    {/* Nachricht bei Fehler */}
    {message && <p className="text-red-600 mb-4">{message}</p>}

    {/* Login Formular */}
    <form className="w-full max-w-sm space-y-4 text-left" onSubmit={onSubmit}>
      {/* E-Mail */}
      <div>
        <label className="block text-gray-900 font-semibold mb-1">
          E-Mail
        </label>
        <input
          type="email"
          className="w-full px-4 py-2 rounded-full border-2 border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      {/* Passwort */}
      <div>
        <label className="block text-gray-900 font-semibold mb-1">
          Passwort
        </label>
        <input
          type="password"
          className="w-full px-4 py-2 rounded-full border-2 border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <p className="mt-1 text-sm text-emerald-700 font-semibold">
          <Link to={`/auth/forgot?email=${encodeURIComponent(email)}`}>
            Passwort vergessen?
          </Link>
        </p>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        className="w-full text-white py-3 rounded-full text-lg font-bold bg-emerald-900 hover:bg-emerald-950 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Bitte warten…" : "Login"}
      </button>
    </form>

    {/* Link zu Registrieren */}
    <p className="mt-10 text-base md:text-lg text-gray-900 font-medium">
      Sie haben noch kein Konto?{" "}
      <Link to="/register" className="text-emerald-700 font-semibold underline">
        Registrieren
      </Link>
    </p>

    {/* Link zurück zur Startseite */}
    <p className="mt-4">
      <Link to="/" className="text-emerald-700 underline">
        Zurück zur Startseite
      </Link>
    </p>
  </div>
);

}
