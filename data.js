/* =========================================================
   SAMBALPUR CRICKET LEAGUE — EDIT THIS FILE TO UPDATE THE SITE
   No coding needed: change the text between the quotes.
   ⚠️ Teams, results and player stats below are SAMPLE data —
   replace them with real ones (or empty the lists: [] ) before going live.
   Empty lists show a friendly "coming soon" message instead.
   ========================================================= */

window.CLUB = {
  name: "Sambalpur Cricket League",
  short: "SCL",
  edition: "Championship 2026",
  tagline: "Let's get ready for the biggest tournament. Register fast — limited slots!",
  city: "Sambalpur, Odisha",
  logo: "",                         // e.g. "logo.png" — upload the logo file to GitHub next to index.html

  instagram: "https://www.instagram.com/scl_26_championship/",
  instagramHandle: "@scl_26_championship",
  whatsapp: "",                     // organiser number with country code, e.g. "919876543210". "" hides it.
  contactEmail: "",                 // e.g. "scl2026@gmail.com". "" hides it.

  // Paste your Google Apps Script Web App URL here (see README.md, Step 1)
  formEndpoint: "PASTE_YOUR_APPS_SCRIPT_URL_HERE",

  /* ---------- REGISTRATION & PAYMENT ---------- */
  registration: {
    deadline: "2026-11-20T23:59:59+05:30",   // form closes automatically after this. Extend by changing the date.
    fee: 500,                                // ₹ per player
    upiId: "coolrohit122001-2@oksbi",                 // organiser's UPI ID — used for the QR code and "Pay with UPI app" button
    payeeName: "Sambalpur Cricket League",   // name shown in the UPI app
    qrImage: "payment-qr.png"                // optional: your own QR image, e.g. "payment-qr.png".
                                             // Leave "" and a QR with ₹500 pre-filled is made from the UPI ID automatically.
  },

  /* ---------- TOURNAMENT INFO (stat strip). Leave "" to hide an item. ---------- */
  info: {
    prizePool: "",                 // e.g. "₹51,000"
    format: "",                    // e.g. "T10 · Tennis ball"
    startDate: ""                  // e.g. "2026-12-14T08:00:00+05:30"
  },

  /* ---------- NEXT MATCH (top card with countdown) ---------- */
  nextMatch: {
    title: "Opening Match",
    teams: "Sambalpur Strikers vs Hirakud Hurricanes",
    date: "2026-12-14T08:00:00+05:30",
    venue: "Venue to be announced",
    note: "Registrations open — limited team slots"
  },

  /* ---------- POINTS TABLE ---------- */
  pointsTable: [
    { team: "Sambalpur Strikers",   p: 3, w: 3, l: 0, nr: 0, pts: 6, nrr: "+1.842" },
    { team: "Hirakud Hurricanes",   p: 3, w: 2, l: 1, nr: 0, pts: 4, nrr: "+0.615" },
    { team: "Burla Blasters",       p: 3, w: 2, l: 1, nr: 0, pts: 4, nrr: "+0.210" },
    { team: "Mahanadi Warriors",    p: 3, w: 1, l: 2, nr: 0, pts: 2, nrr: "-0.402" },
    { team: "Budharaja Royals",     p: 3, w: 1, l: 2, nr: 0, pts: 2, nrr: "-0.918" },
    { team: "Dhanupali Dynamos",    p: 3, w: 0, l: 3, nr: 0, pts: 0, nrr: "-1.330" }
  ],
  qualifyTop: 4,   // how many teams qualify (highlighted in the table)

  /* ---------- RESULTS (newest first) ---------- */
  results: [
    { date: "2026-12-07", teamA: "Sambalpur Strikers", scoreA: "112/4 (10)", teamB: "Mahanadi Warriors", scoreB: "96/7 (10)",  winner: "Sambalpur Strikers", summary: "Won by 16 runs",    mom: "Rakesh P. — 48 (22)" },
    { date: "2026-12-07", teamA: "Burla Blasters",     scoreA: "88/9 (10)",  teamB: "Hirakud Hurricanes", scoreB: "89/3 (8.2)", winner: "Hirakud Hurricanes", summary: "Won by 7 wickets", mom: "Sunil B. — 3/14" },
    { date: "2026-12-06", teamA: "Budharaja Royals",   scoreA: "101/6 (10)", teamB: "Dhanupali Dynamos", scoreB: "94/8 (10)",  winner: "Budharaja Royals",   summary: "Won by 7 runs",     mom: "Ashish M. — 39 (18)" }
  ],

  /* ---------- PLAYER LEADERBOARDS ---------- */
  batting: [
    { name: "Rakesh P.",  team: "Sambalpur Strikers", runs: 132, hs: "48",  sr: 196.2 },
    { name: "Ashish M.",  team: "Budharaja Royals",   runs: 104, hs: "39",  sr: 173.3 },
    { name: "Deepak S.",  team: "Hirakud Hurricanes", runs: 97,  hs: "44*", sr: 161.6 },
    { name: "Pradeep N.", team: "Burla Blasters",     runs: 81,  hs: "37",  sr: 150.0 },
    { name: "Manas K.",   team: "Mahanadi Warriors",  runs: 76,  hs: "31",  sr: 145.4 }
  ],
  bowling: [
    { name: "Sunil B.",   team: "Hirakud Hurricanes", wickets: 8, best: "3/14", econ: 6.9 },
    { name: "Bikash R.",  team: "Sambalpur Strikers", wickets: 7, best: "3/11", econ: 7.2 },
    { name: "Jitendra D.",team: "Burla Blasters",     wickets: 5, best: "2/9",  econ: 7.8 },
    { name: "Santosh T.", team: "Budharaja Royals",   wickets: 5, best: "2/16", econ: 8.5 },
    { name: "Lalit P.",   team: "Dhanupali Dynamos",  wickets: 4, best: "2/18", econ: 9.1 }
  ],

  /* ---------- UPCOMING FIXTURES ---------- */
  fixtures: [
    { date: "2026-12-14", time: "8:00 AM",  title: "Sambalpur Strikers vs Hirakud Hurricanes", venue: "TBA" },
    { date: "2026-12-14", time: "10:30 AM", title: "Burla Blasters vs Mahanadi Warriors",      venue: "TBA" },
    { date: "2026-12-21", time: "8:00 AM",  title: "Semi-final 1",                              venue: "TBA" },
    { date: "2026-12-28", time: "2:00 PM",  title: "🏆 Grand Final",                            venue: "TBA" }
  ],

  defaultDistrict: "Sambalpur"
};
