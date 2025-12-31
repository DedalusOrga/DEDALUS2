import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";

export default function App() {
  const location = useLocation();

  // Diese Seiten sollen KEINE Navigation anzeigen (Login, Register, Reset etc.)
  const hideNav =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/auth");

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 flex flex-col">
      {/* Navigation nur anzeigen, wenn man NICHT auf Login/Register ist */}
      {!hideNav && <NavBar />}

      <main
        id="hauptinhalt"
        className="flex-1 mx-auto w-full max-w-6xl p-6 md:p-10"
      >
        <Outlet />
      </main>
    </div>
  );
}
