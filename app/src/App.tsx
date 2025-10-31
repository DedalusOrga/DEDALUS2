import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen">
      {/* simple shell, später ersetzen */}
      <header className="p-4 border-b">DEDALUS 2</header>
      <main className="p-4"><Outlet /></main>
    </div>
  );
}
