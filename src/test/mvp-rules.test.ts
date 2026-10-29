import { describe, expect, it } from "vitest";
import { isPublicHttpUrl, reviewSchema, signupRole } from "@/lib/validation";

const valid = { id: "11111111-1111-4111-8111-111111111111", status: "approved", reported_views: 1200, proposed_reward: 12.5, review_note: "Reviewed manually" };
describe("Clippza rules", () => {
  it("allows client and clipper signup but never admin", () => { expect(signupRole("client")).toBe("client"); expect(signupRole("clipper")).toBe("clipper"); expect(signupRole("admin")).toBe("clipper"); });
  it("accepts a public clip URL and rejects private or unsafe links", () => { expect(isPublicHttpUrl("https://www.tiktok.com/@creator/video/123")).toBe(true); for (const url of ["javascript:alert(1)", "http://127.0.0.1/clip", "http://192.168.1.2/clip", "https://user:pass@example.com"]) expect(isPublicHttpUrl(url)).toBe(false); });
  it("requires a review note for each decision", () => { expect(reviewSchema.safeParse(valid).success).toBe(true); expect(reviewSchema.safeParse({ ...valid, review_note: " " }).success).toBe(false); });
  it("reported views must be nonnegative integers", () => { expect(reviewSchema.safeParse({ ...valid, reported_views: -1 }).success).toBe(false); expect(reviewSchema.safeParse({ ...valid, reported_views: 1.5 }).success).toBe(false); });
  it("proposed rewards must be finite and nonnegative", () => { expect(reviewSchema.safeParse({ ...valid, proposed_reward: -1 }).success).toBe(false); expect(reviewSchema.safeParse({ ...valid, proposed_reward: Infinity }).success).toBe(false); });
  it("only approval and rejection are review decisions", () => { expect(reviewSchema.safeParse({ ...valid, status: "submitted" }).success).toBe(false); expect(reviewSchema.safeParse({ ...valid, status: "rejected" }).success).toBe(true); });
});