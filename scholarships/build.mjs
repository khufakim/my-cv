import { readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => readFile(path.join(here, p), "utf8");
const write = (p, s) => writeFile(path.join(here, p), s, "utf8");

const data = JSON.parse(await read("data/scholarships.json"));
const list = data.scholarships;

const parse = (v) => new Date(v.length === 10 ? v + "T23:59:59" : v);
const day = (v) => v.slice(0, 10);
const nextDay = (v) => {
  const d = new Date(day(v) + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const fmt = (v, opts = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(day(v) + "T12:00:00Z").toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });

/* ---------- Apps Script ---------- */
const compact = list.map((s) => ({
  id: s.id,
  name: s.name,
  country: s.country,
  level: s.level,
  funding: s.funding,
  deadline: s.deadline,
  deadlineLabel: s.deadlineLabel,
  status: s.status,
  openDate: s.openDate || "",
  applyUrl: s.applyUrl,
  priority: s.priority
}));
const gsTemplate = await read("email-digest.template.gs");
const gs = gsTemplate.replace("__FALLBACK__", JSON.stringify(compact, null, 2));
await write("email-digest.gs", gs);

/* ---------- Dashboard ---------- */
const template = await read("index.template.html");
const b64 = Buffer.from(gs, "utf8").toString("base64");
const html = template
  .replace("/*__DATA__*/null", JSON.stringify(data))
  .replace("__APPS_SCRIPT__", b64);
await write("index.html", html);

/* ---------- ICS ---------- */
const esc = (v) => String(v)
  .replace(/\\/g, "\\\\")
  .replace(/;/g, "\\;")
  .replace(/,/g, "\\,")
  .replace(/\r?\n/g, "\\n");

const fold = (line) => {
  const out = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, "utf8");
    if (bytes + b > 74) {
      out.push(current);
      current = " " + ch;
      bytes = 1 + b;
    } else {
      current += ch;
      bytes += b;
    }
  }
  if (current) out.push(current);
  return out.join("\r\n");
};

const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const today = new Date().toISOString().slice(0, 10);

let ics = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Scholarship Desk//Khuzaifa Farid//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "X-WR-CALNAME:Scholarships — Khuzaifa Farid",
  fold("X-WR-CALDESC:Fully funded scholarship deadlines for Europe, North America and East Asia."),
  "X-WR-TIMEZONE:Asia/Karachi",
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Karachi",
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:+0500",
  "TZOFFSETTO:+0500",
  "TZNAME:PKT",
  "END:STANDARD",
  "END:VTIMEZONE"
];

for (const s of list) {
  if (day(s.deadline) < today) continue;
  const start = day(s.deadline).replace(/-/g, "");
  const end = nextDay(s.deadline).replace(/-/g, "");
  ics.push(
    "BEGIN:VEVENT",
    `UID:deadline-${s.id}@scholarships.khufakim.github.io`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    fold(`SUMMARY:${esc("DEADLINE · " + s.name)}`),
    fold(`DESCRIPTION:${esc(s.deadlineLabel + " | " + s.funding + " | Apply: " + s.applyUrl + " | Confirm: " + s.sourceUrl + " | " + s.note)}`),
    fold(`URL:${s.applyUrl}`),
    "TRANSP:TRANSPARENT",
    "CATEGORIES:SCHOLARSHIP",
    "BEGIN:VALARM",
    "TRIGGER:-P30D",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc("30 days to apply — " + s.name)}`),
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P7D",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc("1 week to apply — " + s.name)}`),
    "END:VALARM",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc("Closes tomorrow — " + s.name)}`),
    "END:VALARM",
    "END:VEVENT"
  );
}

for (const s of list) {
  if (!s.openDate || day(s.openDate) < today) continue;
  if (!["soon", "expected"].includes(s.status)) continue;
  const start = day(s.openDate).replace(/-/g, "");
  const end = nextDay(s.openDate).replace(/-/g, "");
  ics.push(
    "BEGIN:VEVENT",
    `UID:opens-${s.id}@scholarships.khufakim.github.io`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    fold(`SUMMARY:${esc("OPENS · " + s.name)}`),
    fold(`DESCRIPTION:${esc("Application window expected to open. Prepare the portal account and documents. " + s.sourceUrl)}`),
    fold(`URL:${s.sourceUrl}`),
    "TRANSP:TRANSPARENT",
    "CATEGORIES:SCHOLARSHIP",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    fold(`DESCRIPTION:${esc("Opens tomorrow — " + s.name)}`),
    "END:VALARM",
    "END:VEVENT"
  );
}

ics.push("END:VCALENDAR", "");
await write("scholarships.ics", ics.join("\r\n"));

/* ---------- CSV ---------- */
const cols = ["id", "name", "country", "region", "level", "status", "deadline", "deadlineLabel", "funding", "priority", "ageMax", "restart", "experience", "applyUrl", "sourceUrl", "verified", "note"];
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csv = [cols.join(",")]
  .concat(list.map((s) => cols.map((c) => q(s[c])).join(",")))
  .join("\r\n");
await write("scholarships.csv", "\uFEFF" + csv);

/* ---------- Markdown ---------- */
const statusRank = { open: 0, soon: 1, expected: 2, closed: 3 };
const sorted = [...list].sort((a, b) => {
  const r = statusRank[a.status] - statusRank[b.status];
  if (r) return r;
  return parse(a.deadline) - parse(b.deadline);
});
const statusLabel = { open: "Open now", soon: "Opens soon", expected: "Expected", closed: "Closed" };
const rows = sorted.map((s) => {
  const d = parse(s.deadline);
  const days = Math.floor((d - new Date()) / 86400000);
  const left = days < 0 ? "closed" : days + "d";
  return `| ${fmt(s.deadline)} | **${s.name}** | ${s.country} | ${s.level} | ${s.funding} | ${statusLabel[s.status]} (${left}) | [Apply](${s.applyUrl}) · [Source](${s.sourceUrl}) |`;
}).join("\n");

const gates = list
  .filter((s) => s.ageMax !== undefined || s.ageMin !== undefined || s.experience || s.restart)
  .map((s) => {
    const bits = [];
    if (s.ageMin !== undefined || s.ageMax !== undefined) {
      bits.push(s.ageMin !== undefined ? `age ${s.ageMin}–${s.ageMax ?? "?"}` : `age ≤ ${s.ageMax}`);
    }
    if (s.experience) bits.push(`${s.experience} experience`);
    if (s.restart) bits.push("starts bachelor's from year 1");
    return `| ${s.name} | ${bits.join("; ")} |`;
  }).join("\n");

const md = `# Scholarship tracker — Khuzaifa Farid

**Tracks:** bachelor's 2027 and master's 2028 · **Regions:** Europe, North America, East Asia (+ Middle East wildcards)  
**English:** IELTS / TOEFL taken · **Email:** khuzaifakhufa@gmail.com  
**Last verified:** ${data.lastVerified}

> Dates marked **Official** were read from the programme's own page on ${fmt(data.lastVerified)}. Dates marked **Expected** follow the previous cycle and must be confirmed when the new call opens. Always confirm on the official page before paying a fee or booking a test.

## Deadlines

| Deadline | Programme | Country | Level | Funding | Status | Links |
|---|---|---|---|---|---|---|
${rows}

## Eligibility gates

| Programme | Gate |
|---|---|
${gates}

## What this system does and does not do

- It tracks dates, funding terms, eligibility gates and document lists, and checks them against official pages.
- A local re-check runs every Monday at 09:00 (Asia/Karachi): it verifies dates, updates this tracker and writes a note to \`digests/\`.
- It sends a weekly Gmail digest from your own Google account (see \`email-digest.gs\`).
- It does **not** log into portals, sign documents or submit applications. Those need your accounts and your signature.
- The Monday re-check needs Qoder running at that hour, and the weekly email reads the saved tracker. Re-verify before submitting.

## Files

- \`index.html\` — dashboard (works offline), live at https://khufakim.github.io/my-cv/scholarships/
- \`scholarships.ics\` — calendar with 30/7/1-day alarms (Asia/Karachi)
- \`scholarships.csv\` — spreadsheet import
- \`email-digest.gs\` — Google Apps Script weekly mailer
- \`data/scholarships.json\` — source of truth
- \`scholarships.json\` — public feed read by the Gmail script
- \`digests/\` — weekly notes written after each re-verification
- \`digests/email-preview.html\` — sample of the weekly email
`;
await write("scholarships.md", md);
await copyFile(path.join(here, "data/scholarships.json"), path.join(here, "scholarships.json"));

console.log(`Built ${list.length} scholarships`);
console.log(`Deadlines: ${list.filter((s) => day(s.deadline) >= today).length} upcoming`);
console.log(`ICS events: ${ics.filter((l) => l === "BEGIN:VEVENT").length}`);
console.log(`Dashboard: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
console.log(`Script: ${(Buffer.byteLength(gs) / 1024).toFixed(1)} KB`);
