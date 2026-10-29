import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Megaphone, PlusCircle, ListChecks, ShieldCheck, LogOut, Compass, Menu, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { QueryFeedback } from "@/components/QueryFeedback";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { to: string; label: string; icon: typeof LayoutGrid };

export function AppShell({ children }: { children: ReactNode }) {
  const { me, loading, error, retry } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = [{ to: "/dashboard", label: "Overview", icon: LayoutGrid }];
  if (me?.isClient) items.push({ to: "/campaigns", label: "My campaigns", icon: Megaphone }, { to: "/campaigns/new", label: "New campaign", icon: PlusCircle });
  if (me?.isClipper) items.push({ to: "/campaigns", label: "Browse campaigns", icon: Compass }, { to: "/submissions", label: "My submissions", icon: ListChecks });
  if (me?.isAdmin) items.push({ to: "/admin", label: "Review queue", icon: ShieldCheck });
  if (me?.isClient || me?.isClipper) items.push({ to: "/profile", label: "Profile", icon: UserRound });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const roleLabel = me?.isAdmin ? "Admin" : me?.isClient ? "Client" : me?.isClipper ? "Clipper" : "";

  const navLinks = (onNavigate?: () => void) => items.map((i) => (
    <Link key={i.to + i.label} to={i.to} activeOptions={{ exact: true }} onClick={onNavigate}
      className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-foreground/80 transition hover:bg-ink-2 hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
      activeProps={{ className: "bg-lime !text-lime-foreground font-semibold hover:bg-lime" }}>
      <i.icon className="size-4" aria-hidden /> <span>{i.label}</span>
    </Link>
  ));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-ink px-4 py-3 text-ink-foreground md:h-screen md:flex-col md:items-stretch md:justify-start md:px-4 md:py-6">
        <Logo className="md:px-2" />
        <nav className="hidden md:mt-8 md:flex md:flex-col md:gap-1" aria-label="Main">{navLinks()}</nav>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="min-h-10 min-w-10 rounded-lg hover:bg-ink-2 hover:text-ink-foreground"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-ink-2 bg-ink text-ink-foreground [&>button]:text-ink-foreground">
              <SheetHeader className="text-left">
                <SheetTitle className="text-ink-foreground">Menu</SheetTitle>
                <SheetDescription className="text-ink-foreground/70">{me?.name}{roleLabel && ` · ${roleLabel}`}</SheetDescription>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Main">{navLinks(() => setMenuOpen(false))}</nav>
              <Button variant="ghost" onClick={signOut} className="mt-6 flex min-h-11 w-full items-center justify-start gap-2 rounded-lg px-3 text-sm text-ink-foreground/80 hover:bg-ink-2 hover:text-ink-foreground">
                <LogOut className="size-4" /> Sign out
              </Button>
            </SheetContent>
          </Sheet>
        </div>
        <div className="hidden md:mt-auto md:block">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-ink-2 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me?.name}</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-lime">{roleLabel}</p>
            </div>
            <ThemeToggle className="hover:bg-ink" />
          </div>
          <Button variant="ghost" onClick={signOut} className="mt-2 flex w-full justify-start items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-foreground/80 hover:bg-ink-2 hover:text-ink-foreground">
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="mx-auto min-w-0 w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">{loading ? <p role="status" className="text-muted-foreground">Loading your account…</p> : error ? <QueryFeedback error={error} retry={retry} /> : children}</main>
    </div>
  );
}

export function PageHeader({ title, kicker, action }: { title: string; kicker?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{kicker}</p>}
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed p-10 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-ink text-lime">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
