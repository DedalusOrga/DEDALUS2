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
    <div className="px-4 py-8 sm:px-8 sm:py-12 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {/* LINKE SEITE */}
          <div className="max-w-xl flex flex-col">
            <h1 className="text-3xl font-bold text-emerald-900 sm:text-4xl lg:text-5xl">
              Willkommen bei DEDALUS
            </h1>

            {/* TEXT + BUTTONS */}
            <div className="mt-6 sm:mt-10 lg:mt-24">
              <p className="text-base text-emerald-800 mb-6 max-w-md sm:text-lg sm:mb-8">
                In der Bedienhilfe finden Sie einfache Erklärungen und ein
                kurzes Video zur Nutzung der WebApp.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={() => navigate("/fragen")}
                  className="w-full px-7 py-4 rounded-full border-2 border-emerald-700 
             text-emerald-800 font-semibold text-base
             bg-emerald-50
             hover:bg-emerald-100
             active:scale-[0.98]
             transition sm:w-auto"
                >
                  Zur Bedienhilfe
                </button>

                {/* <button
                onClick={() => navigate("/admin")}
                className="px-6 py-3 rounded-full border border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Adminbereich öffnen
              </button> */}
              </div>
            </div>
          </div>

          {/* RECHTE SEITE */}
          <div className="w-full flex flex-col items-center lg:w-[500px] lg:flex-shrink-0 lg:items-end md:self-end">
            <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-none">
              <div className="aspect-square w-full rounded-full overflow-hidden shadow-xl lg:h-[500px] lg:w-[500px]">
                <img
                  src={thoraxImage}
                  alt="Gebäude des Deutschen Krebsforschungszentrums"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-center text-emerald-900 opacity-70 lg:text-right md:whitespace-nowrap">
              © Krebsinformationsdienst, Deutsches Krebsforschungszentrum,
              Fotograf Tobias Schwerdt, Wiesenbach
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
