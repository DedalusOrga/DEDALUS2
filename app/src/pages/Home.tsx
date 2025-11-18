// Home.tsx
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useContentModulesLazy } from "../hooks/useContentModulesLazy";
import ModuleRenderer from "../components/ModuleRenderer";

export default function Home() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  const { modules, loading, loadedOnce, loadModules } = useContentModulesLazy({
    type: "pdf",
    slug: "leitfaden",
  });

  async function onLogout() {
    await signOut();
    nav("/login", { replace: true });
  }

  function InformationenOverview() {
    nav("/informationen", { replace: true });
  }

  return (
    <div className="space-y-2">
      <div>Hallo {user?.email}</div>

      <button className="border px-3 py-2" onClick={InformationenOverview}>
        Weiterleiten
      </button>

      <button className="border px-3 py-2" onClick={onLogout}>
        Logout
      </button>

      <div className="opacity-60">[Placeholder: Inhalte / Navigation]</div>

      {/* Inhalte aus content_modules */}
      <div className="mt-4 space-y-3">
        {!loadedOnce && !loading && (
          <button className="border px-3 py-2" onClick={loadModules}>
            Inhalte laden
          </button>
        )}

        {loading && <div>Inhalte werden geladen …</div>}

        {modules.map((m) => (
          <ModuleRenderer key={m.id} module={m} />
        ))}
      </div>
    </div>
  );
}
