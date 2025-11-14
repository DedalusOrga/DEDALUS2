import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../infrastructure/supabase/client"; // Pfad: pages/ → ../infrastructure

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        setMsg(null);

        const {error} = await supabase.auth.signUp({email, password});

        if (error) setMsg("Fehler bei der Registrierung.");
        else {
            setMsg("Konto erstellt! Bitte jetzt einloggen …");
            setTimeout(() => navigate("/login"), 1200);
        }
        setBusy(false);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF7E9] px-4 text-center">

            {/* Überschrift */}
            <h1 className="text-6xl font-bold text-[#0D3B2E] mb-4">
                Willkommen zur DEDALUS 2
            </h1>

            {/* Unterüberschrift */}
            <p className=" text-2xl font-bold text-lg text-[#0D1B2A] mb-8">
                Erstellen Sie ein Konto, um fortzufahren.
            </p>

            <form className="w-full max-w-sm space-y-3">
                {/* Name */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Name</label>
                    <input
                        type="text"
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                    />
                </div>

                {/* E-Mail */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">E-Mail</label>
                    <input
                        type="email"
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                    />
                </div>

                {/* Passwort */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Passwort</label>
                    <input
                        type="password"
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                    />
                </div>

                {/* Passwort bestätigen */}
                <div className="flex flex-col w-full">
                    <label className="mb-1 font-bold text-[#0D1B2A] text-left">Passwort bestätigen</label>
                    <input
                        type="password"
                        className="w-[100%] text-center border-2 border-[#335F50] rounded-full px-4 py-2 focus:outline-none"
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    className="w-full bg-[#0D3B2E] text-white font-bold py-3 rounded-full mt-4"
                >
                    Registrieren
                </button>
            </form>

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