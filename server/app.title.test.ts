import { describe, expect, it } from "vitest";

describe("CoachFlow application title", () => {
  it("uses the requested public title", () => {
    expect(process.env.VITE_APP_TITLE).toBe("CoachFlow - Client Acquisition System");
  });
});
