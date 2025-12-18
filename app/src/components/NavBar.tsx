// Neue Navigation basierend auf dem Screenshot
// Tabs: Bedienhilfe, Informationen, Entscheidungen, Einstellungen

import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  // Style für aktive und inaktive Tabs
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-3 text-base font-semibold border-b-2 transition-colors outline-none 
     focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ${
       isActive
         ? "text-emerald-700 border-emerald-600"
         : "text-slate-900 border-transparent hover:text-emerald-700"
     }`;

  return (
    <header className="bg-emerald-50">
      {/* Weißer Menü-Balken */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex items-center justify-between rounded-t-xl bg-white shadow-sm">
          <nav
            className="flex items-center gap-4 md:gap-8 px-6"
            aria-label="Hauptnavigation"
          >
            <NavLink to="/home/informationen-uebersicht" className={tabClass}>
              Informationen
            </NavLink>

            <NavLink to="/home/entscheidungen" className={tabClass}>
              Entscheidungen
            </NavLink>

            <NavLink to="/bedienhilfe" className={tabClass}>
              Bedienhilfe
            </NavLink>

          </nav>

          <div className="pr-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
