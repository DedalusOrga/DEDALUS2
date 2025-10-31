import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../infrastructure/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    nav("/");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="w-full border p-2" placeholder="E-Mail" type="email"
             value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border p-2" placeholder="Passwort" type="password"
             value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p className="text-red-600">{err}</p>}
      <button className="border px-3 py-2" disabled={busy}>{busy ? "…" : "Einloggen"}</button>
    </form>
  );
}
