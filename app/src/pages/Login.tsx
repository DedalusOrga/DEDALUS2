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

        if (result.error) setMessage(result.error);
        else navigate("/home");

        setLoading(false);
    }


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF7E9] px-4 text-center">

                {/* Titel */}
                <h1 className="text-6xl md:text-5xl font-bold text-green-900 mb-4">
                    Willkommen zur DEDALUS 2
                </h1>

                {/* Beschreibung */}
                <p className="text-2xl mb-10 text-black font-bold">
                    Hier können Sie sich sicher anmelden.
                </p>

                {/* Nachricht bei Fehler */}
                {message && <p className="text-red-600 mb-4">{message}</p>}

                {/* Login Formular */}
                <form className="w-full max-w-sm space-y-6" onSubmit={onSubmit}>
                    {/* E-Mail */}
                    <div className="text-left">
                        <label className="block text-black font-bold mb-1">E-Mail</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 rounded-full border-2 focus:outline-none"
                            style={{ borderColor: "#335F50" }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Passwort */}
                    <div className="text-left">
                        <label className="block text-black font-bold mb-1">Passwort</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-full border-2 focus:outline-none"
                            style={{ borderColor: "#335F50" }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className="text-left text-med text-green-700 font-semibold mt-0">
                            <Link
                                to="/auth/forgot"
                            >
                                Haben Sie Ihr Passwort vergessen?
                            </Link>


                        </p>

                    </div>

                    {/* Passwort vergessen*/}


                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full text-white py-3 rounded-full text-lg font-bold transition"
                        style={{ backgroundColor: "#133F32" }}
                        disabled={loading}
                    >
                        {loading ? "Bitte warten..." : "Login"}
                    </button>
                </form>

                {/* Link zu Registrieren */}
                <p className="mt-14 text-lg text-black font-bold">
                    Sie haben noch kein Konto?{" "}
                    <Link
                        to="/register"
                        className="text-green-700 font-bold underline"
                    >
                        Registrieren
                    </Link>
                </p>

                {/* Link zurück zur Startseite */}
                <p className="mt-4">
                    <Link to="/" className="text-green-700 underline">
                        Zurück zur Startseite
                    </Link>
                </p>
            </div>

    );
}