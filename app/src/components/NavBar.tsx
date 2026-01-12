import { useState } from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

import { useIsAdmin } from "../hooks/useIsAdmin";
import AdminContentPicker from "../components/AdminContentPicker";

export default function NavBar() {
  const { isAdmin, loading } = useIsAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-3 text-base font-semibold border-b-2 transition-colors outline-none 
     focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ${
       isActive
         ? "text-emerald-700 border-emerald-600"
         : "text-slate-900 border-transparent hover:text-emerald-700"
     }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-base font-semibold transition-colors ${
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-slate-900 hover:bg-emerald-50"
    }`;

  // ✅ Pfade aus main.tsx
  const PATH_INFO = "/informationen-uebersicht";
  const PATH_DECISIONS = "/entscheidungen";
  const PATH_HELP = "/fragen"; // <- Es gibt keine /bedienhilfe-Route

  return (
    <header className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-4">
            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center">
              <NavLink to={PATH_INFO} className={tabClass}>
                Informationen
              </NavLink>

              <NavLink to={PATH_DECISIONS} className={tabClass}>
                Entscheidungen
              </NavLink>

              <NavLink to={PATH_HELP} className={tabClass}>
                Bedienhilfe
              </NavLink>

              {/* Admin direkt neben Bedienhilfe (Desktop) */}
              {!loading && isAdmin && (
                <div className="ml-6 pl-6 border-l border-emerald-200">
                  <AdminContentPicker expectedType="text" />
                </div>
              )}
            </nav>

            {/* Mobile: Hamburger */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
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

            {/* Logout immer rechts */}
            <div className="py-3">
              <LogoutButton />
            </div>
          </div>

          {/* Mobile Menu Panel */}
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
                  <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 p-2">
                    <AdminContentPicker expectedType="text" />
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
