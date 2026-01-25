import { useEffect, useState } from "react";
import { supabase } from "../infrastructure/supabase/client";
import { useAuth } from "./AuthProvider";

export function useIsAdmin() {
  const { loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();

      if (cancelled) return;

      if (error) {
        console.warn("admin check error", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data?.is_admin);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return { isAdmin, loading, user, authLoading };
}
