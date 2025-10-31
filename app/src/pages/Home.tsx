import { useAuth } from "../hooks/AuthProvider";

export default function Home() {
  const { user, signOut } = useAuth();
  return (
    <div className="space-y-2">
      <div>Hallo {user?.email}</div>
      <button className="border px-3 py-2" onClick={signOut}>Logout</button>
      <div className="opacity-60">[Placeholder: Inhalte / Navigation]</div>
    </div>
  );
}
