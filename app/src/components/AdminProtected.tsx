import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";
import { supabase } from "../infrastructure/supabase/client";
import { useEffect, useState } from "react";

export default function AdminProtected({ children }: { children: ReactNode }) {
  const { loading: authLoading, user } = useAuth();

  const [adminLoading, setAdminLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // solange Auth noch lädt, kein Admin-Check
    if (authLoading) return;

    // wenn kein User -> gar nicht erst Admin prüfen
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;

    async function checkAdmin() {
      setAdminLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (error) {
        console.warn("admin check error", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data?.is_admin);
      }

      setAdminLoading(false);
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Auth lädt noch → wir warten
  if (authLoading) return <div>Lädt…</div>;

  // nicht eingeloggt → weg zur Login-Seite
  if (!user) return <Navigate to="/login" replace />;

  // Admin-Check läuft → Ladeanzeige
  if (adminLoading) return <div>Prüfe Admin-Rechte…</div>;

  // kein Admin → zurück auf Startseite
  if (!isAdmin) return <Navigate to="/" replace />;

  // alles gut → Admin-Inhalt anzeigen
  return <>{children}</>;
}
