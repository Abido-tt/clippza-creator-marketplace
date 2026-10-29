import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2 font-display text-xl font-extrabold", className)}>
      <span className="relative grid size-8 place-items-center rounded-md bg-lime text-lime-foreground">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      Clippza
    </Link>
  );
}
