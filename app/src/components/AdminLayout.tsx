import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthProvider";

type Props = {
  title: string;
  children: ReactNode;
};

type TabKey = "content" | "questions" | "routing";

export default function AdminLayout({ title, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const activeTab: TabKey = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/admin/questions")) return "questions";
    if (p.startsWith("/admin/decision-trees")) return "routing";
    return "content";
  }, [location.pathname]);

  const tabBase =
    "px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap";
  const tabActive = "bg-emerald-900 text-white";
  const tabInactive = "text-emerald-900 hover:bg-emerald-50";

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 md:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-emerald-900 hover:text-emerald-700"
          >
            <span className="text-2xl mr-2">←</span> Zurück
          </button>

          <div className="text-center">
            <div className="text-emerald-950 font-semibold">Admin</div>
            <div className="text-xs text-emerald-800">{user?.email ?? ""}</div>
          </div>

          <button onClick={handleLogout} className="text-emerald-900 underline">
            Logout
          </button>
        </div>

        {/* Title + Tabs */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mb-4">
            {title}
          </h1>

          <div className="inline-flex bg-white rounded-full shadow-sm p-1 border border-slate-100 gap-1">
            <button
              onClick={() => navigate("/admin")}
              className={`${tabBase} ${
                activeTab === "content" ? tabActive : tabInactive
              }`}
            >
              Inhalte hinzufügen
            </button>

            <button
              onClick={() => navigate("/admin/questions")}
              className={`${tabBase} ${
                activeTab === "questions" ? tabActive : tabInactive
              }`}
            >
              Fragen hinzufügen
            </button>

            <button
              onClick={() => navigate("/admin/decision-trees")}
              className={`${tabBase} ${
                activeTab === "routing" ? tabActive : tabInactive
              }`}
            >
              Fragebogen bearbeiten
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
