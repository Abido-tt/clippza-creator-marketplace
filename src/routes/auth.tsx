import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Clapperboard, Scissors, Circle, CircleCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth";
import { signupRole } from "@/lib/validation";
import { passwordRules, signinSchema, signupSchema } from "@/lib/auth-validation";

type Search = { mode?: "signin" | "signup"; role?: "client" | "clipper" | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s["mode"] === "signup" ? "signup" : "signin",
    role: s["role"] === "client" ? "client" : s["role"] === "clipper" ? "clipper" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or join — Clippza" },
      { name: "description", content: "Sign in to Clippza or create a Client or Clipper account." },
      { property: "og:title", content: "Sign in or join — Clippza" },
      { property: "og:description", content: "Create a Client or Clipper account on Clippza." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useSession();
  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);
  const [mode, setMode] = useState(search.mode ?? "signin");
  const [role, setRole] = useState<"client" | "clipper">(search.role ?? "clipper");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorFlash, setErrorFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  function changeField(field: string, value: string) {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    setFieldErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setFieldErrors({});
    setFormError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = (mode === "signup" ? signupSchema : signinSchema).safeParse({ name, email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        errors[field] ??= issue.message;
      }
      setFieldErrors(errors);
      const first = (mode === "signup" ? ["name", "email", "password"] : ["email", "password"]).find((field) => errors[field]);
      if (first) {
        (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>(`#${first}`)?.focus();
        toast.error(errors[first]);
      }
      setErrorFlash(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setErrorFlash(false), 700);
      return;
    }
    setFieldErrors({});
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { role: signupRole(role), display_name: name.trim() } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-ink p-10 text-ink-foreground grid-ink md:flex">
        <Logo />
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-none">
            Every clip<br /><span className="text-lime">gets a fair look.</span>
          </h1>
          <p className="mt-4 max-w-sm text-ink-foreground/70">Submissions are reviewed by people, with a clear note on every decision.</p>
        </div>
        <div className="filmstrip h-3" aria-hidden />
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden"><Logo /></div>
          {sent ? (
            <div className="surface-card p-8">
              <h2 className="font-display text-2xl font-bold">Check your inbox</h2>
              <p className="mt-2 text-muted-foreground">We sent a confirmation link to <b>{email}</b>. Open it to activate your {role} account.</p>
              <Button variant="outline" className="mt-5" onClick={() => { setSent(false); setMode("signin"); }}>Return to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="surface-card space-y-5 p-6 sm:p-8">
              <div>
                <h2 className="font-display text-3xl font-extrabold">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{mode === "signup" ? "Choose how you'll use Clippza." : "Sign in to your dashboard."}</p>
              </div>
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                    {([["client", "Client", "I run campaigns", Clapperboard], ["clipper", "Clipper", "I make clips", Scissors]] as const).map(([v, l, d, Icon]) => (
                      <Button variant="outline" type="button" role="radio" aria-checked={role === v} key={v} onClick={() => setRole(v)}
                        className={cn("h-auto flex-col items-start whitespace-normal rounded-lg border-2 p-4 text-left transition", role === v ? "border-ink bg-lime/30" : "border-border hover:border-ink/40")}>
                        <Icon className="size-5" />
                        <p className="mt-2 font-display font-bold">{l}</p>
                        <p className="text-xs text-muted-foreground">{d}</p>
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Display name (required)</Label>
                    <Input id="name" required maxLength={60} autoComplete="nickname" value={name} onChange={(e) => changeField("name", e.target.value)} aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} className={cn(fieldErrors.name && "border-destructive", fieldErrors.name && errorFlash && "auth-error-flash")} />
                    {fieldErrors.name && <p id="name-error" className="text-sm text-destructive">{fieldErrors.name}</p>}
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (required)</Label>
                <Input id="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={(e) => changeField("email", e.target.value)} aria-invalid={!!fieldErrors.email} aria-describedby={fieldErrors.email ? "email-error" : undefined} className={cn(fieldErrors.email && "border-destructive", fieldErrors.email && errorFlash && "auth-error-flash")} />
                {fieldErrors.email && <p id="email-error" className="text-sm text-destructive">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password (required)</Label>
                <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : 1} value={password} onChange={(e) => changeField("password", e.target.value)} aria-invalid={!!fieldErrors.password} aria-describedby={[mode === "signup" ? "password-rules" : "", fieldErrors.password ? "password-error" : ""].filter(Boolean).join(" ") || undefined} className={cn(fieldErrors.password && "border-destructive", fieldErrors.password && errorFlash && "auth-error-flash")} />
                {mode === "signup" && <ul id="password-rules" aria-label="Password requirements" className="space-y-1.5 pt-2 text-sm">
                  {passwordRules.map((rule) => {
                    const complete = rule.test(password);
                    const Icon = complete ? CircleCheck : Circle;
                    return <li key={rule.id} className={cn("flex items-center gap-2", complete ? "text-success-foreground" : "text-muted-foreground")}>
                      <Icon className="size-4 shrink-0" aria-hidden /><span>{rule.label}<span className="sr-only">{complete ? ": complete" : ": not yet met"}</span></span>
                    </li>;
                  })}
                </ul>}
                {mode === "signup" && <span role="status" aria-live="polite" className="sr-only">{passwordRules.filter((rule) => rule.test(password)).length} of 5 password requirements complete.</span>}
                {fieldErrors.password && <p id="password-error" className="text-sm text-destructive">{fieldErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? `Join as ${role === "client" ? "Client" : "Clipper"}` : "Sign in"}
              </Button>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
              <p className="text-center text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account? " : "New to Clippza? "}
                <Button variant="link" type="button" className="h-auto p-0 font-semibold text-foreground underline" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}>
                  {mode === "signup" ? "Sign in" : "Create an account"}
                </Button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
