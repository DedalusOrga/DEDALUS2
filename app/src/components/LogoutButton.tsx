import { supabase } from "../infrastructure/supabase/client";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => await supabase.auth.signOut()}
      className="text-sm text-gray-500 underline"
    >
      Logout
    </button>
  );
}
