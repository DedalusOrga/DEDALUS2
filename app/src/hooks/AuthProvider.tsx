import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../infrastructure/supabase/client";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <Ctx.Provider value={{ user, loading, signOut }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
