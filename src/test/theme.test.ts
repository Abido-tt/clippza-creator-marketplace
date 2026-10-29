import { describe, it, expect } from "vitest";
import { resolveTheme } from "@/lib/theme";
describe("theme preference", () => {
  it("follows the system on first visit", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
  it("remembers the saved choice over the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});
