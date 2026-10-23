import assert from "node:assert/strict";
import test from "node:test";
import { summarizeLegacyTraffic, summarizeVisitors, type LegacyTrafficRow, type VisitorDayRow } from "./VisitorAnalyticsRepository";
import { readVisitor, signVisitor, visitorKey } from "@/infrastructure/security/visitorIdentity";

const day = (changes: Partial<VisitorDayRow> = {}): VisitorDayRow => ({
  identity: "browser-a", member: false, visitorFirstSeen: new Date("2026-10-20T10:00:00Z"),
  day: "2026-10-20", device: "mobile", source: "google", country: "JO", city: "Amman",
  browser: "Chrome", operatingSystem: "Android", ...changes
});

test("period totals deduplicate days and browser aliases while preserving the daily peak", () => {
  const rows = [
    day({ identity: "account-a", member: true }),
    day({ identity: "account-a", member: true, day: "2026-10-21" }),
    day({ identity: "account-a", member: true, day: "2026-10-21", device: "desktop" }),
    day({ identity: "browser-b", day: "2026-10-21", visitorFirstSeen: new Date("2026-10-21T10:00:00Z") })
  ];
  const stats = summarizeVisitors(rows, null, "2026-10-20");
  assert.equal(stats.guests, 1);
  assert.equal(stats.members, 1);
  assert.deepEqual(stats.daily.map((row) => row.total), [1, 2]);
  assert.deepEqual(stats.peakDay, { date: "2026-10-21", count: 2 });
  assert.deepEqual(stats.devices, [{ key: "mobile", count: 2 }]);
  for (const dimension of [stats.sources, stats.countries, stats.cities, stats.browsers, stats.operatingSystems]) {
    assert.equal(dimension.reduce((sum, row) => sum + row.count, 0), 2);
  }
});

test("new and returning visitors use their first known appearance, not their number of visits", () => {
  const stats = summarizeVisitors([
    day({ day: "2026-10-21" }),
    day({ identity: "browser-b", day: "2026-10-21", visitorFirstSeen: new Date("2026-10-20T21:00:00Z") })
  ], new Date("2026-10-20T21:00:00Z"), "2026-10-20");
  assert.equal(stats.newVisitors, 1);
  assert.equal(stats.returningVisitors, 1);
  assert.equal(summarizeVisitors([], null, null).peakDay, null);
});

test("historical visits and all their dimensions remain independent of unique visitors", () => {
  const row: LegacyTrafficRow = {
    day: "2026-10-20", guests: 1250, members: 1738, mobile: 2635, desktop: 350, tablet: 3,
    google: 397, instagram: 20, facebook: 96, other: 2475,
    countries: { JO: 2700 }, cities: { Amman: 1800 }, browsers: { Chrome: 2000 }, operatingSystems: { Android: 2300 }
  };
  const previous = JSON.stringify(row);
  const legacy = summarizeLegacyTraffic([row]);
  assert.equal(legacy.guests + legacy.members, 2988);
  assert.equal(legacy.daily[0].total, 2988);
  assert.deepEqual(legacy.countries, [{ key: "JO", count: 2700 }]);
  assert.deepEqual(legacy.cities, [{ key: "Amman", count: 1800 }]);
  assert.equal(JSON.stringify(row), previous);
  assert.equal(summarizeVisitors([day()], null, row.day).guests, 1);
});

test("visitor cookies reject tampering and identifiers are separated by purpose", () => {
  const previous = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = "visitor-analytics-unit-test";
  try {
    const id = "8f071d8a-70a4-413c-bde1-869bbfd88729";
    assert.equal(readVisitor(signVisitor(id)), id);
    assert.equal(readVisitor(signVisitor(id) + "0"), null);
    assert.equal(readVisitor(`${id}.${"0".repeat(64)}`), null);
    assert.notEqual(visitorKey(`browser:${id}`), visitorKey(`volunteer:${id}`));
  } finally {
    if (previous === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = previous;
  }
});
