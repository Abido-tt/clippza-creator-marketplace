import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleCheck, CircleAlert, Circle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { passwordRules } from "@/lib/auth-validation";
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
  validateSearch: (s: Record<string, unknown>): { mode?: "recovery" } => (s["mode"] === "recovery" ? { mode: "recovery" } : {}),
  component: ConfirmationPage,
});

// Recovery proof: a PASSWORD_RECOVERY event or a recovery token/code in the link. A normal session alone never qualifies.
let recoveryEvent = false;
const initialHref = typeof window === "undefined" ? "" : window.location.href;
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") recoveryEvent = true; });
}

function withTimeout<T>(p: Promise<T>, ms = 10000) {
  return Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

async function verifyRecovery(href: string) {
  const urls = [href, initialHref].filter(Boolean).map((h) => new URL(h));
  const hashes = urls.map((u) => new URLSearchParams(u.hash.slice(1)));
  if (urls.some((u) => u.searchParams.has("error") || u.searchParams.has("error_code")) || hashes.some((h) => h.has("error") || h.has("error_code"))) throw new Error("expired");
  const code = urls.map((u) => u.searchParams.get("code")).find(Boolean) ?? null;
  const tokenLink = hashes.some((h) => h.get("type") === "recovery" && h.has("access_token"));
  if (!code && !tokenLink && !recoveryEvent) throw new Error("missing");
  // getSession waits for SDK initialization, which consumes recovery tokens/codes.
  const { data } = await withTimeout(supabase.auth.getSession());
  if (code && !recoveryEvent) {
    if (data.session) throw new Error("unverified"); // code was not a recovery exchange
    const { error } = await withTimeout(supabase.auth.exchangeCodeForSession(code));
    if (error) throw new Error("expired");
  }
  const { data: u, error } = await withTimeout(supabase.auth.getUser());
  if (error || !u.user) throw new Error("no session");
}

function ConfirmationPage() {
  const isRecovery = Route.useSearch().mode === "recovery";
  return isRecovery ? <RecoveryPage /> : <EmailConfirmation />;
}

function RecoveryPage() {
  const [state, setState] = useState<"checking" | "form" | "done" | "error">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  useEffect(() => {
    let active = true;
    verifyRecovery(window.location.href)
      .then(() => { if (active) setState("form"); })
      .catch(() => { if (active) setState("error"); })
      .finally(() => { if (active) window.history.replaceState(window.history.state, "", `${window.location.pathname}?mode=recovery`); });
    return () => { active = false; };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!passwordRules.every((r) => r.test(password))) next.password = "Complete all five password requirements.";
    if (!confirm) next.confirm = "Confirm your new password.";
    else if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    const first = next.password ? "new-password" : next.confirm ? "confirm-password" : null;
    if (first) {
      e.currentTarget.querySelector<HTMLInputElement>(`#${first}`)?.focus();
      toast.error(next.password ?? next.confirm);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setErrors({ form: error.message });
      toast.error(error.message);
      return;
    }
    await supabase.auth.signOut();
    setPassword(""); setConfirm("");
    setState("done");
    toast.success("Password updated.");
  }

  return <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
    <Logo />
    <div className="w-full max-w-md">
      {state === "checking" && <h1 role="status" className="text-center font-display text-3xl font-bold">Checking your reset link…</h1>}
      {state === "error" && <div role="alert" className="space-y-5 text-center">
        <CircleAlert className="mx-auto size-12 text-destructive" aria-hidden />
        <h1 className="font-display text-3xl font-extrabold">This reset link has expired</h1>
        <p className="text-muted-foreground">Reset links work once and expire after a short time. Request a new one from the sign-in page using “Forgot password?”.</p>
        <Button asChild variant="lime"><Link to="/auth" search={{ mode: "signin" }}>Request a new reset link</Link></Button>
      </div>}
      {state === "done" && <div role="status" className="space-y-5 text-center">
        <CircleCheck className="mx-auto size-12 text-success-foreground" aria-hidden />
        <h1 className="font-display text-3xl font-extrabold">Password updated</h1>
        <p className="text-muted-foreground">Sign in with your new password to continue.</p>
        <Button asChild variant="lime"><Link to="/auth" search={{ mode: "signin" }}>Return to sign in</Link></Button>
      </div>}
      {state === "form" && <form onSubmit={submit} noValidate className="surface-card space-y-5 p-6 sm:p-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your Clippza account.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password (required)</Label>
          <div className="relative">
            <Input id="new-password" type={show ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(e) => { setPassword(e.target.value); setErrors((c) => ({ ...c, password: "" })); }} aria-invalid={!!errors.password} aria-describedby={["reset-rules", errors.password ? "new-password-error" : ""].filter(Boolean).join(" ")} className={cn("pr-11", errors.password && "border-destructive auth-error-flash")} />
            <Button type="button" variant="ghost" size="icon" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow((v) => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </Button>
          </div>
          <ul id="reset-rules" aria-label="Password requirements" className="space-y-1.5 pt-2 text-sm">
            {passwordRules.map((rule) => {
              const complete = rule.test(password);
              const Icon = complete ? CircleCheck : Circle;
              return <li key={rule.id} className={cn("flex items-center gap-2", complete ? "text-success-foreground" : "text-muted-foreground")}>
                <Icon className="size-4 shrink-0" aria-hidden /><span>{rule.label}<span className="sr-only">{complete ? ": complete" : ": not yet met"}</span></span>
              </li>;
            })}
          </ul>
          <span role="status" aria-live="polite" className="sr-only">{passwordRules.filter((r) => r.test(password)).length} of 5 password requirements complete.</span>
          {errors.password && <p id="new-password-error" className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password (required)</Label>
          <Input id="confirm-password" type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((c) => ({ ...c, confirm: "" })); }} aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? "confirm-password-error" : undefined} className={cn(errors.confirm && "border-destructive auth-error-flash")} />
          {errors.confirm && <p id="confirm-password-error" className="text-sm text-destructive">{errors.confirm}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Saving…" : "Update password"}</Button>
        {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
      </form>}
    </div>
  </main>;
}

function EmailConfirmation() {
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