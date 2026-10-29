export const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram Reels" },
  { value: "youtube", label: "YouTube Shorts" },
  { value: "x", label: "X" },
  { value: "other", label: "Other" },
] as const;

export const platformLabel = (p: string) => PLATFORMS.find((x) => x.value === p)?.label ?? p;

export const fmtNum = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en", { notation: "compact" }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

export { isPublicHttpUrl as isHttpUrl } from "@/lib/validation";
