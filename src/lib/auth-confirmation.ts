import type { SupabaseClient } from "@supabase/supabase-js";

type ConfirmationAuth = Pick<SupabaseClient["auth"], "getSession" | "getUser" | "exchangeCodeForSession">;
export type ConfirmationResult = "confirmed" | "signed-in";

export async function confirmEmail(auth: ConfirmationAuth, href: string): Promise<ConfirmationResult> {
  const url = new URL(href, "https://clippza.invalid");
  const hash = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has("error") || hash.has("error") || url.searchParams.has("error_code") || hash.has("error_code")) {
    throw new Error("This confirmation link has expired or is invalid. Try signing in if you already confirmed your email, or sign up again to request a new link.");
  }
  if (hash.get("type") && hash.get("type") !== "signup") {
    throw new Error("This is not a signup confirmation link.");
  }
  // SDK initialization consumes implicit tokens and PKCE codes before getSession resolves.
  const { data, error } = await auth.getSession();
  if (error) throw new Error("We couldn't verify this link. Try opening the confirmation email again.");
  const code = url.searchParams.get("code");
  if (!data.session && code) {
    const exchanged = await auth.exchangeCodeForSession(code);
    if (exchanged.error) throw new Error("This link could not be confirmed. Open it in the browser where you signed up, or request a new link.");
  }
  const verified = await auth.getUser();
  if (verified.error || !verified.data.user?.email_confirmed_at) {
    throw new Error("We couldn't confirm your email from this link. Try signing in if you already confirmed it, or sign up again to request a new link.");
  }
  return code || (hash.has("access_token") && hash.get("type") === "signup") ? "confirmed" : "signed-in";
}