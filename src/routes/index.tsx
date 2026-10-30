import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Clapperboard, Link2, ShieldCheck, Megaphone, Scissors, ClipboardCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import hero from "@/assets/hero-phone.jpg";
import { useSession } from "@/lib/auth";

const sections = [["#roles", "For brands & clippers"], ["#review", "How review works"]] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clippza — Where campaigns meet clippers" },
      { name: "description", content: "Brands post short-form clipping campaigns. Clippers publish clips and submit links. Every submission is manually reviewed." },
      { property: "og:title", content: "Clippza — Where campaigns meet clippers" },
      { property: "og:description", content: "A two-sided marketplace for short-form video clipping campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let pauseTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const nextY = Math.max(0, window.scrollY);
      const hasFocus = headerRef.current?.matches(":focus-within");
      if (nextY <= 8 || menuOpen || hasFocus || nextY < lastY) {
        setNavHidden(false);
      } else if (nextY > lastY) {
        setNavHidden(true);
      }
      lastY = nextY;
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => setNavHidden(false), 180);
    };
    if (menuOpen) setNavHidden(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(pauseTimer);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-ink text-ink-foreground grid-ink">
        <div className="h-24" aria-hidden />
        <header ref={headerRef} aria-hidden={navHidden || undefined} inert={navHidden}
          className={`fixed inset-x-4 top-3 z-30 mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-2 rounded-full border border-ink-foreground/20 bg-ink/95 px-4 py-2 text-ink-foreground shadow-lime backdrop-blur-md transition-transform duration-200 ease-out motion-reduce:transition-none sm:px-5 ${navHidden ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0"}`}>
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {sections.map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-ink-foreground/80 transition hover:bg-ink-2 hover:text-ink-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button asChild variant="inkOutline" size="sm" className="hidden sm:inline-flex"><Link to={user ? "/dashboard" : "/auth"}>{user ? "Dashboard" : "Sign in"}</Link></Button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
               <Button variant="ghost" size="icon" aria-label="Open menu" className="min-h-10 min-w-10 rounded-lg hover:bg-ink-2 hover:text-ink-foreground md:hidden"><Menu className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 border-ink-2 bg-ink text-ink-foreground [&>button]:text-ink-foreground">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-ink-foreground">Menu</SheetTitle>
                  <SheetDescription className="text-ink-foreground/70">Explore Clippza</SheetDescription>
                </SheetHeader>
                <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
                  {sections.map(([href, label]) => (
                    <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-ink-foreground/85 hover:bg-ink-2 hover:text-ink-foreground">{label}</a>
                  ))}
                  <Link to={user ? "/dashboard" : "/auth"} onClick={() => setMenuOpen(false)} className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-lime px-3 text-sm font-semibold text-lime-foreground">{user ? "Dashboard" : "Sign in"}</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 md:grid-cols-[1.15fr_1fr] md:pt-16">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-3 py-1 font-mono text-xs uppercase tracking-widest">
              <span className="size-2 rounded-full bg-lime rec-dot" /> Short-form clipping marketplace
            </p>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] md:text-7xl">
              Campaigns in.<br />
              <span className="text-lime">Clips out.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-foreground/75">
              Clippza connects brands that need reach with clippers who cut, post and submit short-form videos.
              Every submission is reviewed by a human before any reward is recorded.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="lime" size="lg">
                <Link to="/auth" search={{ mode: "signup", role: "client" }}>Join as Client <ArrowRight /></Link>
              </Button>
              <Button asChild variant="inkOutline" size="lg">
                <Link to="/auth" search={{ mode: "signup", role: "clipper" }}>Join as Clipper <Scissors /></Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="viewfinder overflow-hidden rounded-2xl">
              <img src={hero} alt="Creator clip playing on a phone" width={896} height={1152} className="aspect-[4/5] w-full object-cover" />
            </div>
            <div className="absolute -left-6 bottom-8 hidden rounded-xl bg-card p-3 text-card-foreground shadow-lime sm:block">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Submission</p>
              <p className="font-display font-bold">Approved ✓</p>
            </div>
          </div>
        </div>
        <div className="filmstrip h-4 bg-ink-2" aria-hidden />
      </section>

      <section id="roles" className="mx-auto max-w-6xl scroll-mt-4 px-5 py-20">
        <h2 className="font-display text-3xl font-extrabold md:text-5xl">Two sides. One workflow.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Side
            tag="For clients"
            title="Launch a clipping campaign"
            items={[
              [Megaphone, "Post a brief, platform, reference link and reward terms."],
              [Clapperboard, "Open it to clippers, pause or close it any time."],
              [ClipboardCheck, "See every clip submitted to your campaigns."],
            ]}
            cta={<Link to="/auth" search={{ mode: "signup", role: "client" }}>Join as Client</Link>}
          />
          <Side
            dark
            tag="For clippers"
            title="Clip, post, submit"
            items={[
              [Scissors, "Browse open campaigns and read the brief."],
              [Link2, "Publish your clip, then submit its public URL."],
              [ShieldCheck, "Track review status from submitted to approved."],
            ]}
            cta={<Link to="/auth" search={{ mode: "signup", role: "clipper" }}>Join as Clipper</Link>}
          />
        </div>
      </section>

      <section id="review" className="scroll-mt-4 border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {[
            ["01", "Submitted", "A clipper submits a public clip URL to an open campaign."],
            ["02", "Reviewed", "An admin checks the clip and records reported views and a proposed reward."],
            ["03", "Approved or rejected", "The decision and note are shown to the clipper and client."],
          ].map(([n, t, d]) => (
            <div key={n}>
              <p className="font-mono text-sm text-muted-foreground">{n}</p>
              <h3 className="mt-2 font-display text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Honest by design: views and proposed rewards are manual in-app records, not verified platform analytics.
          Rewards are noncash records. Clippza does not process payments or payouts.
        </p>
      </section>

    </div>
  );
}

function Side({ tag, title, items, cta, dark }: { tag: string; title: string; items: [typeof Megaphone, string][]; cta: React.ReactNode; dark?: boolean }) {
  return (
    <div className={dark ? "rounded-2xl bg-ink p-8 text-ink-foreground" : "surface-card p-8"}>
      <p className="font-mono text-xs uppercase tracking-widest opacity-70">{tag}</p>
      <h3 className="mt-2 font-display text-3xl font-bold">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map(([Icon, t]) => (
          <li key={t} className="flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-lime text-lime-foreground"><Icon className="size-4" /></span>
            <span className="pt-1">{t}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant={dark ? "lime" : "default"} className="mt-8">{cta}</Button>
    </div>
  );
}
