import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, resolveTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* storage blocked */ }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(resolveTheme(stored, mql.matches));
    // Keep following the system until the user picks a theme.
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* ignore */ }
      if (saved) return;
      const next = resolveTheme(null, e.matches);
      applyTheme(next);
      setTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* ignore */ }
    setTheme(next);
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <Button type="button" variant="ghost" size="icon" onClick={toggle} aria-label={label} title={label}
      className={cn("min-h-10 min-w-10 rounded-lg text-current hover:bg-ink-2 hover:text-ink-foreground", className)}>
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
