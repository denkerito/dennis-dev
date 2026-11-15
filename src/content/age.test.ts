import { describe, expect, it } from "vitest";

import { ageAt, formatAge, milanMidnight } from "./age";

const birth = { year: 2005, month: 10, day: 31 };
const SECOND = 1000;

describe("milanMidnight", () => {
  it("is UTC+1 on 31 October when summer time has already ended", () => {
    // 2026: the last Sunday of October is the 25th.
    expect(new Date(milanMidnight(2026, 10, 31)).toISOString()).toBe("2026-10-30T23:00:00.000Z");
  });

  it("is UTC+2 when 31 October is itself the last Sunday", () => {
    // 2027: 31 October is a Sunday, and summer time ends at 01:00 UTC that day.
    expect(new Date(milanMidnight(2027, 10, 31)).toISOString()).toBe("2027-10-30T22:00:00.000Z");
  });

  it("is UTC+1 in winter and UTC+2 in summer", () => {
    expect(new Date(milanMidnight(2026, 1, 15)).toISOString()).toBe("2026-01-14T23:00:00.000Z");
    expect(new Date(milanMidnight(2026, 7, 15)).toISOString()).toBe("2026-07-14T22:00:00.000Z");
  });
});

describe("ageAt", () => {
  it("adds a whole year one second after midnight on the birthday", () => {
    const age = ageAt(milanMidnight(2026, 10, 31) + SECOND, birth);
    expect(Math.floor(age)).toBe(21);
    expect(formatAge(age)).toMatch(/^21\.0000000/);
  });

  it("adds a whole year on a birthday that falls in summer time", () => {
    const age = ageAt(milanMidnight(2027, 10, 31) + SECOND, birth);
    expect(formatAge(age)).toMatch(/^22\.0000000/);
  });

  it("is just below the next year one second before the birthday", () => {
    const age = ageAt(milanMidnight(2026, 10, 31) - SECOND, birth);
    expect(Math.floor(age)).toBe(20);
    expect(formatAge(age)).toMatch(/^20\.9999999/);
  });

  it("reads half a year half way between two birthdays", () => {
    const last = milanMidnight(2026, 10, 31);
    const next = milanMidnight(2027, 10, 31);
    expect(Math.abs(ageAt((last + next) / 2, birth) - 21.5)).toBeLessThan(1e-8);
  });

  it("handles a year of life with 29 February in it", () => {
    // From 31 October 2027 to 31 October 2028 runs through 29 February 2028.
    const last = milanMidnight(2027, 10, 31);
    const next = milanMidnight(2028, 10, 31);
    expect(Math.abs(ageAt((last + next) / 2, birth) - 22.5)).toBeLessThan(1e-8);
    expect(Math.floor(ageAt(milanMidnight(2028, 2, 29), birth))).toBe(22);
  });
});

describe("formatAge", () => {
  it("truncates to eight decimals", () => {
    expect(formatAge(21.123456789)).toBe("21.12345678");
  });
});
