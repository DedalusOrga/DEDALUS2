import { NavLink, useLocation, useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

import { useIsAdmin } from "../hooks/useIsAdmin";
import AdminContentPicker from "../components/AdminContentPicker";

export default function NavBar() {
  const { isAdmin, loading } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  // Fragebogen-Kontext erkennen
  const isQuestionnaireFlow =
    location.pathname.startsWith("/entscheidungen/frageboegen") ||
    location.pathname.startsWith("/entscheidungen/fragebogen/");

  // (Optional) exakter, falls du andere /entscheidungen/fragebogen... Routen hast:
  // const isQuestionnaireFlow =
  //   location.pathname === "/entscheidungen/frageboegen" ||
  //   location.pathname.startsWith("/entscheidungen/fragebogen/");

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-3 text-base font-semibold border-b-2 transition-colors outline-none 
     focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 ${
       isActive
         ? "text-emerald-700 border-emerald-600"
         : "text-slate-900 border-transparent hover:text-emerald-700"
     }`;

  return (
    <header className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="flex items-center justify-between rounded-t-xl bg-white shadow-sm">
          <nav
            className="flex items-center gap-4 md:gap-8 px-6"
            aria-label="Hauptnavigation"
          >
            <NavLink to="/informationen-uebersicht" className={tabClass}>
              Informationen
            </NavLink>

            <NavLink to="/entscheidungen" className={tabClass}>
              Entscheidungen
            </NavLink>

            <NavLink to="/bedienhilfe" className={tabClass}>
              Bedienhilfe
            </NavLink>
          </nav>

          <div className="pr-6 flex items-center gap-4">
            {/* Admin-Bereich: im Fragebogen-Kontext -> Link zu Entscheidungsbaum-Admin */}
            {!loading && isAdmin && isQuestionnaireFlow && (
              <button
                type="button"
                onClick={() => navigate("/admin/entscheidungsbaeume")}
                className="text-sm font-semibold text-emerald-900 hover:underline"
                title="Entscheidungsbaum-Routing bearbeiten"
              >
                Admin
              </button>
            )}

            {/* Admin-Bereich: sonst -> dein bestehender ContentPicker */}
            {!loading && isAdmin && !isQuestionnaireFlow && (
              <AdminContentPicker expectedType="text" />
            )}

            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
