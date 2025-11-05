// Home.tsx
import { useAuth } from "../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  async function onLogout() {
    await signOut();                 
    nav("/login", { replace: true });
  }

  return (
    <div className="space-y-2">
      <div>Hallo {user?.email}</div>
      <button className="border px-3 py-2" onClick={onLogout}>Logout</button>
      <div className="opacity-60">[Placeholder: Inhalte / Navigation]</div>
    </div>
  );
}
