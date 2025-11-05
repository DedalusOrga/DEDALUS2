import { supabase } from "../supabase/client";

const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 30_000;

let failedAttempts = 0;
let lockedUntil: number | null = null;

export async function handleLogin(email: string, password: string) {
  const now = Date.now();

  if (lockedUntil && now < lockedUntil) {
    const wait = Math.ceil((lockedUntil - now) / 1000);
    return { error: `Zu viele Fehlversuche. Bitte warte ${wait} Sekunden.` };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockedUntil = now + LOCK_DURATION;
      failedAttempts = 0;
    }
    return { error: "Login fehlgeschlagen. Bitte überprüfe deine Daten." };
  }

  failedAttempts = 0;
  lockedUntil = null;
  return { success: true };
}
