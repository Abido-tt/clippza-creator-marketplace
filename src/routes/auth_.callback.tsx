import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { confirmEmail } from "@/lib/auth-confirmation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth_/callback")({
  head: () => ({ meta: [
    { title: "Email confirmation — Clippza" },
    { name: "description", content: "Confirm your Clippza email and continue to your account." },
    { property: "og:title", content: "Email confirmation — Clippza" },
    { property: "og:description", content: "Confirm your email and continue to Clippza." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const [state, setState] = useState<"checking" | "confirmed" | "signed-in" | "error">("checking");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    const href = window.location.href;
    confirmEmail(supabase.auth, href).then((result) => {
      if (active) setState(result);
    }).catch(() => {
      if (active) {
        setMessage("This link could not be verified or has expired. Try signing in if you already confirmed your email, or sign up again to request a new confirmation link.");
        setState("error");
      }
    }).finally(() => {
      // Do not leave credentials or email error details in browser history.
      if (active) window.history.replaceState(window.history.state, "", window.location.pathname);
    });
    return () => { active = false; };
  }, []);

  return <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
    <Logo />
    <div className="w-full max-w-md space-y-5 text-center">
      <div role={state === "error" ? "alert" : "status"} aria-live="polite">
        {state === "checking" ? <h1 className="font-display text-3xl font-bold">Confirming your email…</h1> : <>
          {state === "error" ? <CircleAlert className="mx-auto mb-4 size-12 text-destructive" aria-hidden /> : <CircleCheck className="mx-auto mb-4 size-12 text-success-foreground" aria-hidden />}
          <h1 className="font-display text-3xl font-extrabold">{state === "error" ? "Unable to confirm this link" : state === "confirmed" ? "Email confirmed" : "Your email is confirmed"}</h1>
          <p className="mt-3 text-muted-foreground">{state === "error" ? message : "Your Clippza account is ready. Continue to your dashboard."}</p>
        </>}
      </div>
      {state !== "checking" && <div className="flex flex-wrap justify-center gap-3">
        {state !== "error" && <Button asChild variant="lime"><Link to="/dashboard">Continue to dashboard</Link></Button>}
        <Button asChild variant="outline"><Link to="/auth" search={{ mode: "signin" }}>Continue to sign in</Link></Button>
        {state === "error" && <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Request a new link</Link></Button>}
      </div>}
    </div>
  </main>;
}