import { useEffect } from "react";
import { supabase } from "../infrastructure/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home");
      else navigate("/auth");
    });
  }, [navigate]);

  return <p className="text-center mt-20">Login wird überprüft …</p>;
}
