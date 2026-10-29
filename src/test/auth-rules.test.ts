import { describe, expect, it, vi } from "vitest";
import { passwordRules, signupSchema, signinSchema } from "@/lib/auth-validation";
import { confirmEmail } from "@/lib/auth-confirmation";

const signup = { name: "Reviewer", email: "reviewer@example.com", password: "Strong1!" };
describe("Signup password rules", () => {
  it("requires at least 8 characters", () => { expect(passwordRules[0].test("Aa1!xxx")).toBe(false); expect(passwordRules[0].test("Aa1!xxxx")).toBe(true); });
  it("requires an uppercase letter", () => { expect(passwordRules[1].test("strong1!")).toBe(false); expect(passwordRules[1].test("Strong1!")).toBe(true); });
  it("requires a lowercase letter", () => { expect(passwordRules[2].test("STRONG1!")).toBe(false); expect(passwordRules[2].test("Strong1!")).toBe(true); });
  it("requires a number", () => { expect(passwordRules[3].test("Strong!!")).toBe(false); expect(passwordRules[3].test("Strong1!")).toBe(true); });
  it("requires a special character, not whitespace", () => { expect(passwordRules[4].test("Strong1 ")).toBe(false); expect(passwordRules[4].test("Strong1!")).toBe(true); });
  it("enforces every rule only on signup", () => {
    expect(signupSchema.safeParse(signup).success).toBe(true);
    for (const password of ["Aa1!xxx", "strong1!", "STRONG1!", "Strong!!", "Strong11"]) expect(signupSchema.safeParse({ ...signup, password }).success).toBe(false);
    expect(signinSchema.safeParse({ email: signup.email, password: "old" }).success).toBe(true);
  });
  it("rejects blank display names and invalid emails", () => {
    expect(signupSchema.safeParse({ ...signup, name: " " }).success).toBe(false);
    expect(signupSchema.safeParse({ ...signup, email: "not-an-email" }).success).toBe(false);
  });
});

function authMock(confirmed = true, session = true) {
  return {
    getSession: vi.fn().mockResolvedValue({ data: { session: session ? {} : null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: { email_confirmed_at: confirmed ? "2026-10-29" : null } }, error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ data: { session: {} }, error: null }),
  };
}
describe("Email confirmation", () => {
  it("verifies an implicit confirmation and does not exchange its tokens", async () => {
    const auth = authMock();
    expect(await confirmEmail(auth, "https://example.com/auth/callback#type=signup&access_token=test-token")).toBe("confirmed");
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
  it("does not exchange an already consumed PKCE code twice", async () => {
    const auth = authMock();
    expect(await confirmEmail(auth, "https://example.com/auth/callback?code=test-code")).toBe("confirmed");
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
  it("exchanges an unconsumed code before validating the user", async () => {
    const auth = authMock(true, false);
    expect(await confirmEmail(auth, "https://example.com/auth/callback?code=test-code")).toBe("confirmed");
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("test-code");
  });
  it("never reports success for an unconfirmed user", async () => {
    await expect(confirmEmail(authMock(false), "https://example.com/auth/callback")).rejects.toThrow();
  });
  it("shows an expired link as failure even with an existing session", async () => {
    await expect(confirmEmail(authMock(), "https://example.com/auth/callback#error=access_denied&error_code=otp_expired")).rejects.toThrow();
  });
});