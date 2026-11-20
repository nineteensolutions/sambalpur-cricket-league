# Sambalpur Cricket League — Website

A free, mobile-first site for the Instagram "link in bio" (@scl_26_championship):
registration countdown, points table, results, Orange/Purple cap leaderboards,
fixtures, and the **player registration form** (same questions as the Google Form, but
**no Google sign-in needed**, so players don't drop off).

Each registration:
- saves the **passport photo, Aadhaar and payment screenshot** to a **private Google Drive folder**
- adds a row to a **Google Sheet** (download as Excel anytime) with links to those files
- **rejects a UTR number that was already used** (stops people reusing one payment screenshot)
- **emails the organiser**, and the player too if they gave an email

```
index.html                    ← the website
data.js                       ← EDIT THIS: dates, fee, UPI ID, teams, results, stats
qrcode.js                     ← makes the payment QR code (don't edit)
google-apps-script/Code.gs    ← paste into Google Apps Script (form backend)
```

---

## Step 1 — Connect the form (Google Sheet + Drive + email) · ~10 min

Use the organiser's Gmail account for this — files and emails will go there.

1. Go to **sheets.google.com** → blank sheet → name it *SCL 2026 Registrations*.
2. **Extensions → Apps Script**. Delete the sample code, paste all of `google-apps-script/Code.gs`.
3. At the top, set `ORGANISER_EMAIL` and check `FEE` and `DEADLINE`. Click 💾 Save.
4. Choose **`setup`** in the function dropdown → **▶ Run** → **Review permissions** → pick the account →
   *Advanced → Go to project (unsafe)* → **Allow**. (Normal for your own script.)
   This creates the **Registrations** tab and a Drive folder **SCL 2026 Registrations**.
5. **Deploy → New deployment** → ⚙️ **Web app** → Execute as: **Me** · Who has access: **Anyone** → **Deploy**.
   Copy the **Web app URL** (ends in `/exec`).
6. Paste it into `formEndpoint` in `data.js`.

Check: open the `/exec` URL in a browser → you should see `"Registration endpoint is running"`.

> Edited `Code.gs` later? **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** (URL stays the same).

## Step 2 — Fill in data.js

- `registration.deadline` — form closes automatically after this (currently **20 Nov 2026, 11:59 PM**).
  **To extend, just change the date** (also update `DEADLINE` in Code.gs).
- `registration.upiId` — the organiser's UPI ID. This powers:
  - a **QR code with ₹500 pre-filled**, generated automatically (players on a laptop scan it with their phone)
  - a **"Pay ₹500 with UPI app"** button on phones — on Android it opens the "choose app" screen
    (GPay, PhonePe, Paytm, BHIM…); on iPhone there are separate GPay / PhonePe / Paytm buttons
  - a **Copy** button for the UPI ID, as a fallback
- `registration.fee`, `payeeName` — amount and the name shown in the UPI app.
- `registration.qrImage` — set to `payment-qr.png` (the organiser's GPay QR, cleaned up). Upload it with the other files. Set to `""` to use an auto-made QR with ₹500 pre-filled instead.
- `logo` — upload `logo.png` and set `logo: "logo.png"`.
- ⚠️ **Teams, results and player stats are SAMPLE data.** Replace them, or set a list to `[]`
  to show a "coming soon" message.

## Step 3 — Put it online with GitHub Pages (free) · ~5 min

1. Free account at **github.com** → **New repository** → name `scl2026` → **Public** → Create.
2. **Add file → Upload files** → `index.html`, `data.js`, `qrcode.js`, `payment-qr.png`, plus `logo.png` if you have one → **Commit**.
   (Don't upload `Code.gs`.)
3. **Settings → Pages** → Deploy from a branch → **main** / **(root)** → Save.
4. Live in ~1 min at `https://<username>.github.io/scl2026/`
5. Instagram → **Edit profile → Links** → replace the Google Form link with this URL.

Quicker alternative: drag the folder onto **app.netlify.com/drop**.

---

## Handling registrations

- Open the sheet → each row has links to the photo, Aadhaar and payment screenshot.
- Check the ₹500 with that **UTR** arrived in your bank/UPI app → set **Payment status** to *Verified*
  (or *Rejected*). Filter by status to see who's confirmed.
- Excel copy: **File → Download → Microsoft Excel (.xlsx)**.

## Keep Aadhaar data safe 🔒

- The Drive folder is **private** — don't change its sharing to "Anyone with the link".
- Only share the sheet with organisers who need it. The website itself never shows any uploaded file.
- Delete the folder after the tournament if you no longer need the documents.

## Good to know

- **Test the UPI button with a real phone before launch** (pay ₹1 by temporarily setting `fee: 1`).
  Some UPI apps limit "pay with amount" links to personal UPI IDs. If a player's app refuses,
  they can scan the QR or copy the UPI ID — both are on the form. A **UPI business/merchant ID**
  (free from PhonePe Business, Paytm for Business or GPay for Business) avoids these limits.

- A normal Gmail can send ~**100 emails/day** from Apps Script (organiser + player = 2 per registration).
  Set `SEND_CONFIRMATION = false` if you expect more than ~50 registrations a day.
- Phone photos are shrunk in the browser before upload, so registration works on slow mobile data.
- Spam protection (hidden honeypot field) and spreadsheet formula-injection protection are built in.
