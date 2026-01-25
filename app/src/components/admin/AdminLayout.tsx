import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";

type Props = {
  title: string;
  children: ReactNode;
};

type TabKey =
  | "content"
  | "questions"
  | "routing"
  | "recommendations"
  | "glossary"
  | "whitelist"
  | "cards";

export default function AdminLayout({ title, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Beim Routenwechsel Menü schließen (mobile)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const activeTab: TabKey = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith("/admin/questions")) return "questions";
    if (p.startsWith("/admin/decision-trees")) return "routing";
    if (p.startsWith("/admin/glossary")) return "glossary";
    if (p.startsWith("/admin/whitelist")) return "whitelist";
    if (p.startsWith("/admin/cards")) return "cards";
    if (p.startsWith("/admin/recommendations")) return "recommendations";

    return "content";
  }, [location.pathname]);

  const tabBase =
    "px-5 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap";
  const tabActive = "bg-emerald-900 text-white";
  const tabInactive = "text-emerald-900 hover:bg-emerald-50";

  const mobileItemBase =
    "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition";
  const mobileItemActive = "bg-emerald-900 text-white";
  const mobileItemInactive = "text-emerald-900 hover:bg-emerald-50";

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  function go(path: string) {
    navigate(path);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-4 sm:px-6 lg:px-10 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center text-emerald-900 hover:text-emerald-700 shrink-0"
          >
            <span className="text-2xl mr-2">←</span> Zurück
          </button>

          <div className="text-center flex-1">
            <div className="text-emerald-950 font-semibold">Admin</div>
            <div className="text-xs text-emerald-800 break-all">
              {user?.email ?? ""}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-emerald-900 underline shrink-0"
          >
            Logout
          </button>
        </div>

        {/* Title + Tabs / Burger */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950">
              {title}
            </h1>

            {/* Burger: sichtbar bis <lg */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-sm"
              aria-label="Menü öffnen"
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-emerald-900 text-xl leading-none">
                {mobileMenuOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>

          {/* MOBILE MENU: sichtbar bis <lg */}
          <div className="lg:hidden mt-4">
            {mobileMenuOpen && (
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-2">
                <button
                  onClick={() => go("/admin")}
                  className={`${mobileItemBase} ${
                    activeTab === "content"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Inhalte anlegen
                </button>

                <button
                  onClick={() => go("/admin/questions")}
                  className={`${mobileItemBase} ${
                    activeTab === "questions"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Fragen anlegen
                </button>

                <button
                  onClick={() => go("/admin/decision-trees")}
                  className={`${mobileItemBase} ${
                    activeTab === "routing"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Fragebogen zusammenstellen
                </button>

                <button
                  onClick={() => go("/admin/glossary")}
                  className={`${mobileItemBase} ${
                    activeTab === "glossary"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Glossar
                </button>

                <button
                  onClick={() => go("/admin/whitelist")}
                  className={`${mobileItemBase} ${
                    activeTab === "whitelist"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Whitelist
                </button>

                <button
                  onClick={() => go("/admin/cards")}
                  className={`${mobileItemBase} ${
                    activeTab === "cards"
                      ? mobileItemActive
                      : mobileItemInactive
                  }`}
                >
                  Patientenperspektive
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP TABS: erst ab lg */}
          <div className="hidden lg:inline-flex bg-white rounded-full shadow-sm p-1 border border-slate-100 gap-1 mt-4">
            <button
              onClick={() => navigate("/admin")}
              className={`${tabBase} ${
                activeTab === "content" ? tabActive : tabInactive
              }`}
            >
              Inhalte anlegen
            </button>

            <button
              onClick={() => navigate("/admin/questions")}
              className={`${tabBase} ${
                activeTab === "questions" ? tabActive : tabInactive
              }`}
            >
              Fragen anlegen
            </button>

            <button
              onClick={() => navigate("/admin/recommendations")}
              className={`${tabBase} ${
                activeTab === "recommendations" ? tabActive : tabInactive
              }`}
            >
              Empfehlungen anlegen
            </button>

            <button
              onClick={() => navigate("/admin/decision-trees")}
              className={`${tabBase} ${
                activeTab === "routing" ? tabActive : tabInactive
              }`}
            >
              Fragebogen zusammenstellen
            </button>

            <button
              onClick={() => navigate("/admin/glossary")}
              className={`${tabBase} ${
                activeTab === "glossary" ? tabActive : tabInactive
              }`}
            >
              Glossar
            </button>

            <button
              onClick={() => navigate("/admin/whitelist")}
              className={`${tabBase} ${
                activeTab === "whitelist" ? tabActive : tabInactive
              }`}
            >
              Whitelist
            </button>

            <button
              onClick={() => navigate("/admin/cards")}
              className={`${tabBase} ${
                activeTab === "cards" ? tabActive : tabInactive
              }`}
            >
              Patientenperspektive
            </button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
