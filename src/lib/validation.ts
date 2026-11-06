import { z } from "zod";

export function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && host.includes(".") &&
      !/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) && !host.endsWith(".local");
  } catch { return false; }
}

/** Mirrors public.normalize_clip_url: trim, drop #fragment, lowercase scheme+host, strip trailing slashes; path/query case kept. */
export function normalizeClipUrl(value: string) {
  const v = value.split("#")[0].trim();
  const m = v.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/?]*)([^?]*)(\?.*)?$/);
  if (!m) return v;
  return m[1].toLowerCase() + m[2].replace(/\/+$/, "") + (m[3] ?? "");
}

export const isDuplicateError = (e: { code?: string } | null) => e?.code === "23505";

export const reviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reported_views: z.number().int().min(0).max(2147483647).nullable(),
  proposed_reward: z.number().finite().min(0).max(1000000000).nullable(),
  review_note: z.string().trim().min(1, "Leave a review note").max(1000),
});

export const signupRole = (role: unknown): "client" | "clipper" => role === "client" ? "client" : "clipper";