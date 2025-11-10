// App.tsx
import { NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-emerald-50">
      <header className="bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-6 h-12">
            {[
              { to: "/home", label: "Entscheidungen" },
              { to: "/informationen", label: "Informationen" },
              { to: "/hilfe", label: "Hilfe" },
              { to: "/einstellungen", label: "Einstellungen" },
            ].map((i) => (
              <NavLink
                key={i.to}
                to={i.to}
                className={({ isActive }) =>
                  `text-sm md:text-base py-2 border-b-2 -mb-[1px] ${
                    isActive ? "border-emerald-600 text-emerald-700"
                             : "border-transparent text-gray-700 hover:text-emerald-700"
                  }`
                }
              >
                {i.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <Outlet />
      </main>
    </div>
  );
}
