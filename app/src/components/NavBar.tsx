import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useCurrentPageEditEligibility } from "../hooks/useCurrentPageEditEligibility";
import CurrentPageEditorModal from "./CurrentPageEditorModal";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();

  const { canEditCurrentPage, pageKey, pathname } =
    useCurrentPageEditEligibility();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const showEditButton = !loading && isAdmin && canEditCurrentPage;

  // ✅ Deine Pfade (ggf. anpassen)
  const PATH_INFO = "/informationen-uebersicht";
  const PATH_DECISIONS = "/entscheidungen";
  const PATH_HELP = "/fragen";
  const PATH_ADMIN = "/admin";

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-5 py-2 text-sm font-semibold border-b-2 transition-colors outline-none
     focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ${
       isActive
         ? "text-emerald-700 border-emerald-600"
         : "text-slate-900 border-transparent hover:text-emerald-700"
     }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-slate-900 hover:bg-emerald-50"
    }`;

  return (
    <header className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink to={PATH_INFO} className={tabClass}>
                Informationen
              </NavLink>

              <NavLink to={PATH_DECISIONS} className={tabClass}>
                Entscheidungen
              </NavLink>

              <NavLink to={PATH_HELP} className={tabClass}>
                Bedienhilfe
              </NavLink>

              {!loading && isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate(PATH_ADMIN)}
                  className="ml-4 pl-4 border-l border-emerald-200 text-sm font-semibold text-slate-900 hover:text-emerald-700"
                >
                  Admin
                </button>
              )}

              {showEditButton && (
                <button
                  type="button"
                  onClick={() => setEditorOpen(true)}
                  className="ml-4 pl-4 border-l border-emerald-200 text-sm font-semibold text-slate-900 hover:text-emerald-700"
                >
                  Aktuelle Seite bearbeiten (Admin)
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <LogoutButton />

              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                aria-expanded={mobileOpen}
                aria-label="Menü öffnen"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7H20M4 12H20M4 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-emerald-100 px-4 py-3">
              <nav className="flex flex-col gap-2">
                <NavLink
                  to={PATH_INFO}
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Informationen
                </NavLink>

                <NavLink
                  to={PATH_DECISIONS}
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Entscheidungen
                </NavLink>

                <NavLink
                  to={PATH_HELP}
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Bedienhilfe
                </NavLink>

                {!loading && isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(PATH_ADMIN);
                    }}
                    className="mt-1 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:text-emerald-700"
                  >
                    Admin
                  </button>
                )}

                {showEditButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      setEditorOpen(true);
                    }}
                    className="mt-1 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:text-emerald-700"
                  >
                    Aktuelle Seite bearbeiten (Admin)
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>

      <CurrentPageEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        pageKey={pageKey}
      />
    </header>
  );
}
