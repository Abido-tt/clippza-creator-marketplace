export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "clippza-theme";

/** A saved choice wins; otherwise follow the system preference. */
export function resolveTheme(stored: string | null, systemPrefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return systemPrefersDark ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

/** Runs before paint (inlined in <head>) so there is no flash of the wrong theme. */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var t=(s==="light"||s==="dark")?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");var r=document.documentElement;if(t==="dark")r.classList.add("dark");r.style.colorScheme=t;}catch(e){}})();`;
