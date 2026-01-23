import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { supabase } from "../infrastructure/supabase/client";
import thoraxImage from "../assets/thx-klinik.jpg";

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
  <div className="px-16 py-16">
    <div className="flex items-start justify-between gap-16">
      {/* LINKE SEITE */}
      <div className="max-w-xl flex flex-col">
        <h1 className="text-5xl font-bold text-emerald-900">
          Willkommen bei DEDALUS
        </h1>

        {/* TEXT + BUTTONS */}
        <div className="mt-24">
          <p className="text-lg text-emerald-800 mb-8 max-w-md">
            In der Bedienhilfe finden Sie einfache Erklärungen und ein kurzes
            Video zur Nutzung der WebApp.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/fragen")}
              className="px-6 py-3 rounded-full border border-emerald-700 text-emerald-700 hover:bg-emerald-100"
            >
              Zur Bedienhilfe
            </button>

            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Adminbereich öffnen
            </button>
          </div>
        </div>
      </div>

      {/* RECHTE SEITE */}
      <div className="w-[500px] flex-shrink-0">
        <div className="h-[500px] rounded-full overflow-hidden shadow-xl">
          <img
            src={thoraxImage}
            alt="Gebäude des Deutschen Krebsforschungszentrums"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="mt-2 text-xs text-center text-emerald-900 opacity-70">
          © Krebsinformationsdienst, Deutsches Krebsforschungszentrum,
          Fotograf Tobias Schwerdt, Wiesenbach
        </p>
      </div>
    </div>
  </div>
);

}
