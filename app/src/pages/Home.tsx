import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { supabase } from "../infrastructure/supabase/client";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const userId = user.id;

    let cancelled = false;

    async function checkAdmin() {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user?.id)
        .single();

      if (cancelled) return;

      if (error) {
        console.warn("Admin-Check Fehler:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data?.is_admin);
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="px-20 pt-12 pb-24">
      {/* Titel ganz oben */}
      <h1 className="text-5xl font-bold text-emerald-800 mb-32">
        Willkommen bei DEDALUS
      </h1>

      {/* Inhalt darunter */}
      <div className="flex justify-between items-start">
        {/* Linke Spalte */}
        <div className="max-w-xl">
          <p className="text-lg text-emerald-700 mb-10">
            In der Bedienhilfe finden Sie einfache Erklärungen und ein kurzes Video
            zur Nutzung der WebApp.
          </p>

          <div className="flex gap-4">
            <Link to="/bedienhilfe">
              <button className="inline-flex items-center rounded-full border border-emerald-700 px-6 py-3 text-lg font-semibold text-emerald-800 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700">
                Zur Bedienhilfe
              </button>
            </Link>

            <Link to="/admin">
              <button className="inline-flex items-center rounded-full border border-purple-700 px-6 py-3 text-lg font-semibold text-purple-800 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700">
                Adminbereich öffnen
              </button>
            </Link>
          </div>
        </div>

        {/* Rechte Spalte */}
        <div className="w-[420px] h-[320px] bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-400">
          Illustration / Einführung folgt
        </div>
      </div>
    </div>
  );
}