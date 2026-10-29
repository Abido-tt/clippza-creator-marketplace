import { describe, expect, it } from "vitest";
import { mediaFileError, nextChangeDate, normalizeUsername, socialUrlError, usernameError } from "@/lib/profile";

describe("profile rules", () => {
  it("normalizes usernames case-insensitively", () => { expect(normalizeUsername("  @Clip_King ")).toBe("clip_king"); });
  it("rejects invalid usernames", () => { for (const u of ["ab", "has space", "a".repeat(21), "dash-name"]) expect(usernameError(u)).not.toBeNull(); expect(usernameError("good_name1")).toBeNull(); });
  it("display name locks for 7 days after a change", () => { const now = new Date("2026-01-10T00:00:00Z"); expect(nextChangeDate("2026-01-05T00:00:00Z", 7, now)).not.toBeNull(); expect(nextChangeDate("2026-01-02T00:00:00Z", 7, now)).toBeNull(); });
  it("username locks for 30 days after a change", () => { const now = new Date("2026-02-01T00:00:00Z"); expect(nextChangeDate("2026-01-10T00:00:00Z", 30, now)).not.toBeNull(); expect(nextChangeDate("2025-12-31T00:00:00Z", 30, now)).toBeNull(); });
  it("social links must be public https links", () => { expect(socialUrlError("")).toBeNull(); expect(socialUrlError("https://tiktok.com/@me")).toBeNull(); expect(socialUrlError("javascript:alert(1)")).not.toBeNull(); });
  it("uploads must be JPG/PNG/WebP up to 5 MB", () => { expect(mediaFileError({ type: "image/png", size: 1000 })).toBeNull(); expect(mediaFileError({ type: "image/gif", size: 1000 })).not.toBeNull(); expect(mediaFileError({ type: "image/jpeg", size: 6 * 1024 * 1024 })).not.toBeNull(); });
});
