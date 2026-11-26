/**
 * Scholarship Desk — weekly Gmail digest
 * Runs inside YOUR Google account. No password is shared with anyone.
 *
 * Setup (5 minutes):
 *   1. script.google.com -> New project (sign in as khuzaifakhufa@gmail.com)
 *   2. Paste this file over Code.gs
 *   3. Save -> run sendTestEmail -> approve permissions
 *   4. Run createWeeklyTrigger once (Mondays, 09:00 Asia/Karachi)
 *   5. Project Settings -> time zone: Asia/Karachi
 */

const CONFIG = {
  EMAIL: "khuzaifakhufa@gmail.com",
  // Live data. If this URL is not published yet, the embedded FALLBACK list is used.
  JSON_URL: "https://khufakim.github.io/my-cv/scholarships/scholarships.json",
  DASHBOARD_URL: "https://khufakim.github.io/my-cv/scholarships/",
  TIMEZONE: "Asia/Karachi",
  LOOKAHEAD_DAYS: 75,
  OPENING_SOON_DAYS: 60
};

// Generated from scholarships.json — keeps the mailer working before hosting.
const FALLBACK = [
  {
    "id": "hec-csc-2027",
    "name": "Chinese Government Scholarship (Type A, via HEC)",
    "country": "China",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-01-05T16:00:00+05:00",
    "deadlineLabel": "5 Jan 2027 · 4:00 PM PKT",
    "status": "open",
    "openDate": "2026-11-10",
    "applyUrl": "https://scholarship.hec.gov.pk",
    "priority": 1
  },
  {
    "id": "kaist-ug-2027",
    "name": "KAIST International Undergraduate + KAIST Scholarship",
    "country": "South Korea",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-01-14T18:00:00+09:00",
    "deadlineLabel": "14 Jan 2027 · 6:00 PM KST",
    "status": "open",
    "openDate": "2026-11-10",
    "applyUrl": "https://admission.kaist.ac.kr/intl-undergraduate/application/apply",
    "priority": 1
  },
  {
    "id": "nyuad-2027",
    "name": "NYU Abu Dhabi — need-based full aid",
    "country": "UAE",
    "level": "Bachelor's",
    "funding": "Full need-based aid",
    "deadline": "2027-01-05T23:59:00-05:00",
    "deadlineLabel": "5 Jan 2027 · 11:59 PM ET",
    "status": "open",
    "openDate": "2026-08-01",
    "applyUrl": "https://nyuad.nyu.edu/en/admissions/undergraduate/apply.html",
    "priority": 2
  },
  {
    "id": "khalifa-2027",
    "name": "Khalifa University Undergraduate Scholarship",
    "country": "UAE",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-02-01",
    "deadlineLabel": "1 Feb 2027",
    "status": "open",
    "openDate": "2026-10-01",
    "applyUrl": "https://www.ku.ac.ae/admissions/undergraduate",
    "priority": 2
  },
  {
    "id": "turkiye-2027",
    "name": "Türkiye Bursları (Türkiye Scholarships)",
    "country": "Türkiye",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-02-20",
    "deadlineLabel": "20 Feb 2027 (opens 10 Jan)",
    "status": "soon",
    "openDate": "2027-01-10",
    "applyUrl": "https://tbbs.turkiyeburslari.gov.tr",
    "priority": 1
  },
  {
    "id": "stipendium-2027",
    "name": "Stipendium Hungaricum",
    "country": "Hungary",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-01-15",
    "deadlineLabel": "~15 Jan 2027 (call not published)",
    "status": "expected",
    "openDate": "2026-11-15",
    "applyUrl": "https://apply.stipendiumhungaricum.hu",
    "priority": 1
  },
  {
    "id": "romania-2027",
    "name": "Romanian Government Scholarship (MFA)",
    "country": "Romania",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-03-31",
    "deadlineLabel": "~31 Mar 2027 (expected)",
    "status": "expected",
    "openDate": "2027-02-16",
    "applyUrl": "https://scholarships.studyinromania.gov.ro",
    "priority": 2
  },
  {
    "id": "russia-2027",
    "name": "Russian Government Scholarship Quota",
    "country": "Russia",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-01-15",
    "deadlineLabel": "~15 Jan 2027 (country-specific)",
    "status": "expected",
    "openDate": "2026-11-01",
    "applyUrl": "https://education-in-russia.com/",
    "priority": 2
  },
  {
    "id": "mext-ug-2028",
    "name": "MEXT Undergraduate Scholarship",
    "country": "Japan",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-05-31",
    "deadlineLabel": "Apr–May 2027 (embassy window)",
    "status": "expected",
    "openDate": "2027-04-01",
    "applyUrl": "https://www.pk.emb-japan.go.jp/itpr_en/scholarship.html",
    "priority": 2
  },
  {
    "id": "gks-u-2028",
    "name": "Global Korea Scholarship — Undergraduate",
    "country": "South Korea",
    "level": "Bachelor's",
    "funding": "Fully funded",
    "deadline": "2027-09-30",
    "deadlineLabel": "Sep 2027 (embassy track)",
    "status": "expected",
    "openDate": "2027-09-01",
    "applyUrl": "https://www.studyinkorea.go.kr",
    "priority": 3
  },
  {
    "id": "fulbright-2028",
    "name": "Fulbright Foreign Student Program (Pakistan)",
    "country": "United States",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2027-04-01",
    "deadlineLabel": "~1 Apr 2027 (expected)",
    "status": "expected",
    "openDate": "2027-02-01",
    "applyUrl": "https://www.usefp.org/scholarships/fulbright.cfm",
    "priority": 1
  },
  {
    "id": "chevening-2028",
    "name": "Chevening Scholarship",
    "country": "United Kingdom",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2027-10-06",
    "deadlineLabel": "~6 Oct 2027 (expected)",
    "status": "expected",
    "openDate": "2027-08-01",
    "applyUrl": "https://www.chevening.org/scholarships/",
    "priority": 2
  },
  {
    "id": "erasmus-2028",
    "name": "Erasmus Mundus Joint Master's",
    "country": "European Union",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-01-15",
    "deadlineLabel": "Oct 2027 – Jan 2028 (per programme)",
    "status": "expected",
    "openDate": "2027-10-01",
    "applyUrl": "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
    "priority": 1
  },
  {
    "id": "daad-epos-2028",
    "name": "DAAD EPOS Development-Related Postgraduate Courses",
    "country": "Germany",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2027-10-31",
    "deadlineLabel": "Jul–Oct 2027 (per course)",
    "status": "expected",
    "openDate": "2027-07-01",
    "applyUrl": "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    "priority": 2
  },
  {
    "id": "eiffel-2028",
    "name": "Eiffel Excellence Scholarship",
    "country": "France",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-01-08",
    "deadlineLabel": "~8 Jan 2028 (nomination)",
    "status": "expected",
    "openDate": "2027-12-01",
    "applyUrl": "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    "priority": 3
  },
  {
    "id": "si-2028",
    "name": "Swedish Institute Scholarships for Global Professionals",
    "country": "Sweden",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-01-20",
    "deadlineLabel": "~20 Jan 2028 (expected)",
    "status": "expected",
    "openDate": "2027-12-01",
    "applyUrl": "https://si.se/en/apply/scholarships/",
    "priority": 3
  },
  {
    "id": "mext-research-2028",
    "name": "MEXT Research Student Scholarship",
    "country": "Japan",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2027-05-31",
    "deadlineLabel": "Apr–May 2027 (embassy window)",
    "status": "expected",
    "openDate": "2027-04-01",
    "applyUrl": "https://www.pk.emb-japan.go.jp/itpr_en/scholarship.html",
    "priority": 2
  },
  {
    "id": "gks-m-2028",
    "name": "Global Korea Scholarship — Master's",
    "country": "South Korea",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-03-15",
    "deadlineLabel": "Feb–Mar 2028 (embassy track)",
    "status": "expected",
    "openDate": "2028-02-01",
    "applyUrl": "https://www.studyinkorea.go.kr",
    "priority": 3
  },
  {
    "id": "kaist-ms-2028",
    "name": "KAIST International Master's + KAIST Scholarship",
    "country": "South Korea",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-03-15",
    "deadlineLabel": "Sep 2027 / Mar 2028 rounds",
    "status": "expected",
    "openDate": "2027-09-01",
    "applyUrl": "https://admission.kaist.ac.kr/intl-graduate/",
    "priority": 2
  },
  {
    "id": "csc-m-2028",
    "name": "Chinese Government Scholarship — Master's",
    "country": "China",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2028-04-30",
    "deadlineLabel": "Dec 2027 – Apr 2028 (route-dependent)",
    "status": "expected",
    "openDate": "2027-12-01",
    "applyUrl": "https://www.campuschina.org",
    "priority": 2
  },
  {
    "id": "commonwealth-2028",
    "name": "Commonwealth Master's Scholarship (via HEC)",
    "country": "United Kingdom",
    "level": "Master's",
    "funding": "Fully funded",
    "deadline": "2027-11-15",
    "deadlineLabel": "Oct–Nov 2027 (HEC announcement)",
    "status": "expected",
    "openDate": "2027-10-01",
    "applyUrl": "https://www.hec.gov.pk/",
    "priority": 3
  }
];

function sendTestEmail() {
  sendDigest_(true);
}

function sendWeeklyDigest() {
  sendDigest_(false);
}

function createWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendWeeklyDigest") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendWeeklyDigest")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone(CONFIG.TIMEZONE)
    .create();
  Logger.log("Weekly trigger created: Mondays 09:00 " + CONFIG.TIMEZONE);
}

function resetSnapshot() {
  PropertiesService.getScriptProperties().deleteProperty("OPEN_IDS");
  Logger.log("Snapshot cleared. The next run will not report 'newly opened'.");
}

function getData_() {
  try {
    const res = UrlFetchApp.fetch(CONFIG.JSON_URL, { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) {
      const parsed = JSON.parse(res.getContentText());
      if (parsed && parsed.scholarships && parsed.scholarships.length) {
        return { list: parsed.scholarships, lastVerified: parsed.lastVerified || "", live: true };
      }
    }
  } catch (err) {
    Logger.log("Live JSON unavailable: " + err);
  }
  return { list: FALLBACK, lastVerified: "", live: false };
}

function parseDeadline_(value) {
  if (!value) return null;
  const d = new Date(value.length === 10 ? value + "T23:59:59" : value);
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil_(value) {
  const d = parseDeadline_(value);
  if (!d) return null;
  return Math.floor((d.getTime() - Date.now()) / 86400000);
}

function isOpen_(s) {
  const d = daysUntil_(s.deadline);
  return s.status === "open" && d !== null && d >= 0;
}

function fmtDate_(value) {
  if (!value) return "";
  const raw = String(value);
  const d = new Date((raw.length > 10 ? raw.slice(0, 10) : raw) + "T12:00:00Z");
  if (isNaN(d.getTime())) return "";
  return Utilities.formatDate(d, "UTC", "d MMM yyyy");
}

function esc_(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowHtml_(s, mode) {
  const openMode = mode === "open";
  const anchor = openMode ? s.openDate : s.deadline;
  const d = daysUntil_(anchor);
  const when = fmtDate_(anchor);
  const days = d < 0 ? (openMode ? "open now" : "closed") : d === 0 ? (openMode ? "opens today" : "today") : (openMode ? "opens in " + d + " days" : "in " + d + " days");
  const color = d <= 14 ? "#c0392b" : d <= 30 ? "#b9770e" : "#33475b";
  return '' +
    '<tr>' +
      '<td style="padding:12px 10px;border-bottom:1px solid #e6edf3;vertical-align:top;">' +
        '<a href="' + esc_(s.applyUrl) + '" style="color:#0b1f33;font-weight:600;text-decoration:none;font-size:14px;">' + esc_(s.name) + '</a>' +
        '<div style="color:#6b7f90;font-size:12px;margin-top:2px;">' + esc_(s.country) + ' · ' + esc_(s.level) + ' · ' + esc_(s.funding || "") + '</div>' +
      '</td>' +
      '<td style="padding:12px 10px;border-bottom:1px solid #e6edf3;vertical-align:top;white-space:nowrap;font-size:12px;color:#33475b;">' +
        esc_(when) + '<div style="color:' + color + ';font-weight:600;margin-top:2px;">' + days + '</div>' +
      '</td>' +
    '</tr>';
}

function sectionHtml_(title, note, rows) {
  if (!rows.length) return "";
  return '' +
    '<div style="margin:26px 0 6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#0e6f8f;font-weight:700;">' + esc_(title) + '</div>' +
    (note ? '<div style="font-size:12px;color:#6b7f90;margin-bottom:6px;">' + esc_(note) + '</div>' : '') +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + rows.join("") + '</table>';
}

function sendDigest_(isTest) {
  const data = getData_();
  const list = data.list.slice();

  const dated = list.filter(function (s) { return daysUntil_(s.deadline) !== null; })
    .sort(function (a, b) { return parseDeadline_(a.deadline) - parseDeadline_(b.deadline); });

  const urgent = dated.filter(function (s) { const d = daysUntil_(s.deadline); return d >= 0 && d <= 14; });
  const month = dated.filter(function (s) { const d = daysUntil_(s.deadline); return d > 14 && d <= 30; });
  const later = dated.filter(function (s) { const d = daysUntil_(s.deadline); return d > 30 && d <= CONFIG.LOOKAHEAD_DAYS; });
  const opening = dated.filter(function (s) {
    if (!s.openDate || isOpen_(s)) return false;
    const d = daysUntil_(s.openDate);
    return d !== null && d >= 0 && d <= CONFIG.OPENING_SOON_DAYS;
  });

  const props = PropertiesService.getScriptProperties();
  const previous = (props.getProperty("OPEN_IDS") || "").split(",").filter(Boolean);
  const current = list.filter(isOpen_).map(function (s) { return s.id; });
  const newlyOpen = previous.length ? list.filter(function (s) { return isOpen_(s) && previous.indexOf(s.id) === -1; }) : [];

  const next = dated.filter(function (s) { return daysUntil_(s.deadline) >= 0; })[0];
  const count = urgent.length + month.length;
  let subject;
  if (count > 0) {
    subject = "Scholarship Desk — " + count + " deadline" + (count === 1 ? "" : "s") + " in the next 30 days";
  } else if (next) {
    subject = "Scholarship Desk — no urgent deadline; next up " + fmtDate_(next.deadline);
  } else {
    subject = "Scholarship Desk — weekly check";
  }
  if (isTest) subject = "[TEST] " + subject;

  let body = '' +
    '<div style="background:#f4f8fb;padding:24px 0;font-family:Segoe UI,Arial,sans-serif;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe6ee;border-radius:12px;overflow:hidden;">' +
      '<tr><td style="background:#0b1f33;padding:22px 26px;">' +
        '<div style="color:#55c2e8;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Scholarship Desk · Weekly</div>' +
        '<div style="color:#ffffff;font-size:22px;font-weight:700;margin-top:6px;">Your Monday check</div>' +
        '<div style="color:#9fb6c7;font-size:12px;margin-top:4px;">' + esc_(Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "EEEE, d MMMM yyyy")) + ' · ' + esc_(CONFIG.TIMEZONE) + '</div>' +
      '</td></tr>' +
      '<tr><td style="padding:22px 26px 8px;color:#33475b;font-size:14px;line-height:1.6;">' +
        'Khuzaifa — here is the week in scholarships. ' +
        (data.live ? '<span style="color:#1e8449;">Live data loaded.</span>' : '<span style="color:#b9770e;">Using the embedded list (publish the dashboard to switch to live data).</span>') +
      '</td></tr>';

  if (!urgent.length && !month.length && !newlyOpen.length && !opening.length) {
    body += '<tr><td style="padding:8px 26px 20px;color:#33475b;font-size:14px;line-height:1.6;">' +
      'No deadline inside the next 30 days. ' +
      (next ? 'Next up: <b>' + esc_(next.name) + '</b> on ' + esc_(fmtDate_(next.deadline)) + ' (' + daysUntil_(next.deadline) + ' days).' : '') +
      '</td></tr>';
  } else {
    if (newlyOpen.length) body += '<tr><td style="padding:0 26px;">' + sectionHtml_("Newly opened", "These portals were not open last week.", newlyOpen.map(rowHtml_)) + '</td></tr>';
    if (urgent.length) body += '<tr><td style="padding:0 26px;">' + sectionHtml_("Closing in 14 days", "Submit or lock the documents this week.", urgent.map(rowHtml_)) + '</td></tr>';
    if (month.length) body += '<tr><td style="padding:0 26px;">' + sectionHtml_("Closing in 30 days", "", month.map(rowHtml_)) + '</td></tr>';
    if (opening.length) body += '<tr><td style="padding:0 26px;">' + sectionHtml_("Opening soon", "Prepare the account and documents before the window opens.", opening.map(function (s) { return rowHtml_(s, "open"); })) + '</td></tr>';
    if (later.length) body += '<tr><td style="padding:0 26px;">' + sectionHtml_("On the horizon", "Next " + CONFIG.LOOKAHEAD_DAYS + " days.", later.map(rowHtml_)) + '</td></tr>';
    body += '<tr><td style="padding:16px 26px 4px;color:#6b7f90;font-size:11px;">Only deadlines inside ' + CONFIG.LOOKAHEAD_DAYS + ' days are listed. The full list stays on the dashboard.</td></tr>';
  }

  body += '' +
      '<tr><td style="padding:12px 26px 24px;">' +
        '<a href="' + esc_(CONFIG.DASHBOARD_URL) + '" style="display:inline-block;background:#0b1f33;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:11px 18px;border-radius:7px;">Open the tracker</a>' +
      '</td></tr>' +
      '<tr><td style="background:#f4f8fb;padding:16px 26px;color:#6b7f90;font-size:11px;line-height:1.6;border-top:1px solid #dbe6ee;">' +
        'Dates change without notice. Confirm every deadline on the official page before paying a fee or booking a test. ' +
        'This email was generated inside your own Google account; no password was shared. ' +
        (data.lastVerified ? 'Tracker verified ' + esc_(data.lastVerified) + '.' : '') +
      '</td></tr>' +
    '</table></div>';

  MailApp.sendEmail({
    to: CONFIG.EMAIL,
    subject: subject,
    htmlBody: body,
    name: "Scholarship Desk"
  });

  if (!isTest) {
    props.setProperty("OPEN_IDS", current.join(","));
  }
  Logger.log("Sent to " + CONFIG.EMAIL + " (" + (isTest ? "test" : "weekly") + ").");
}
