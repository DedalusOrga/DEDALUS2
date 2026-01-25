import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";

export default function AdminProtected({ children }: { children: ReactNode }) {
  const { isAdmin, loading, authLoading, user } = useIsAdmin();

  // Auth lädt noch
  if (authLoading || loading) {
    return <div className="p-4">Lade…</div>;
  }

  // Nicht eingeloggt
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Eingeloggt, aber kein Admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Admin
  return <>{children}</>;
}
