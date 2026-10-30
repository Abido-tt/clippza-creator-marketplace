import { Logo } from "@/components/Logo";

export function AppFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-8">
        <Logo />
        <p className="text-sm text-ink-foreground/60">
          © 2026 Clippza
          <span className="mx-2 hidden sm:inline" aria-hidden>·</span>
          <span className="sm:hidden"><br /></span>
          <a
            href="https://linktree.abido.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-lime underline decoration-lime/40 underline-offset-4 transition hover:decoration-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Built by Abdelrahman
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
