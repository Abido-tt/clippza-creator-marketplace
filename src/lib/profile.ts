import { isPublicHttpUrl } from "@/lib/validation";

export const BIO_MAX = 160;
export const DISPLAY_NAME_DAYS = 7;
export const USERNAME_DAYS = 30;
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;
export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const SOCIAL_FIELDS = [
  { key: "website_url", label: "Website" },
  { key: "tiktok_url", label: "TikTok" },
  { key: "instagram_url", label: "Instagram" },
  { key: "youtube_url", label: "YouTube" },
  { key: "x_url", label: "X" },
] as const;
export type SocialKey = (typeof SOCIAL_FIELDS)[number]["key"];

/** Mirrors the database: trim, drop a leading @, lowercase. */
export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function usernameError(value: string) {
  const u = normalizeUsername(value);
  if (!/^[a-z0-9_]{3,20}$/.test(u)) return "Use 3–20 letters, numbers or underscores.";
  return null;
}

export function socialUrlError(value: string) {
  const v = value.trim();
  if (!v) return null;
  if (v.length > 300 || !isPublicHttpUrl(v)) return "Enter a full public link starting with https://";
  return null;
}

/** Returns the date the field can next change, or null when it can change now. */
export function nextChangeDate(changedAt: string | null | undefined, days: number, now = new Date()) {
  if (!changedAt) return null;
  const next = new Date(new Date(changedAt).getTime() + days * 86400000);
  return next > now ? next : null;
}

export function mediaFileError(file: { type: string; size: number }) {
  if (!(MEDIA_TYPES as readonly string[]).includes(file.type)) return "Use a JPG, PNG or WebP image.";
  if (file.size > MEDIA_MAX_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}
