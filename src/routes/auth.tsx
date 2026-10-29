import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clapperboard, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

type Search = { mode?: "signin" | "signup"; role?: "client" | "clipper" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "signin",
    role: s.role === "client" ? "client" : s.role === "clipper" ? "clipper" : undefined,
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
  const [mode, setMode] = useState(search.mode ?? "signin");
  const [role, setRole] = useState<"client" | "clipper">(search.role ?? "clipper");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { role, display_name: name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
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
            </div>
          ) : (
            <form onSubmit={submit} className="surface-card space-y-5 p-8">
              <div>
                <h2 className="font-display text-3xl font-extrabold">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{mode === "signup" ? "Choose how you'll use Clippza." : "Sign in to your dashboard."}</p>
              </div>
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
                    {([["client", "Client", "I run campaigns", Clapperboard], ["clipper", "Clipper", "I make clips", Scissors]] as const).map(([v, l, d, Icon]) => (
                      <button type="button" role="radio" aria-checked={role === v} key={v} onClick={() => setRole(v)}
                        className={cn("rounded-xl border-2 p-4 text-left transition", role === v ? "border-ink bg-lime/30" : "border-border hover:border-ink/40")}>
                        <Icon className="size-5" />
                        <p className="mt-2 font-display font-bold">{l}</p>
                        <p className="text-xs text-muted-foreground">{d}</p>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Display name</Label>
                    <Input id="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? `Join as ${role === "client" ? "Client" : "Clipper"}` : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {mode === "signup" ? "Already have an account? " : "New to Clippza? "}
                <button type="button" className="font-semibold text-foreground underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
                  {mode === "signup" ? "Sign in" : "Create an account"}
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
