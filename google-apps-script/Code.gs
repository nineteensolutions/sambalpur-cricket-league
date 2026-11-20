/**
 * Sambalpur Cricket League — Player registration backend (Google Apps Script)
 *
 * For every registration it:
 *   1. Saves the passport photo, Aadhaar and payment screenshot to a PRIVATE
 *      Google Drive folder ("SCL 2026 Registrations") — only you can open them
 *   2. Adds a row to the "Registrations" tab of this Google Sheet, with links
 *      to the files (download as Excel: File → Download → .xlsx)
 *   3. Rejects a UTR number that was already used (stops reused payment screenshots)
 *   4. Emails the organiser, and the player too if they gave an email
 *
 * It also stores the website content edited from admin.html (password protected)
 * and serves it to the public site.
 *
 * Admin password: Project Settings → Script Properties → add  ADMIN_PASSWORD
 *
 * Setup: see README.md, Step 1.
 */

// ====== EDIT THESE ======
const ORGANISER_EMAIL   = 'yourclub@gmail.com';      // comma-separate for more than one
const CLUB_NAME         = 'Sambalpur Cricket League';
const SEASON            = '2026';
const FEE               = 500;                       // ₹ per player
const SEND_CONFIRMATION = true;                      // email the player (only if they gave an email)
const INSTAGRAM_URL     = 'https://www.instagram.com/scl_26_championship/';
const DEADLINE          = '2026-11-20T23:59:59+05:30'; // fallback only — the deadline set in admin.html wins
// ========================

const SHEET_NAME  = 'Registrations';
const FOLDER_NAME = 'SCL ' + SEASON + ' Registrations';
const HEADERS = [
  'Reg ID', 'Submitted at', 'Player name', "Father's name", 'Date of birth', 'Age',
  'Mobile', 'Email', 'Full address', 'Village / Town', 'District',
  'Playing role', 'Batting style', 'Bowling style', 'Bowling type',
  'UTR number', 'Passport photo', 'Aadhaar', 'Payment screenshot', 'Payment status', 'Remarks'
];
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true, id: 'SCL-0' });                 // honeypot → bot
    if (d.action && d.action !== 'register') return json_(admin_(d));

    const site = readContent_() || {};
    const reg = site.registration || {};
    const deadline = reg.deadline || DEADLINE;
    const fee = Number(reg.fee) || FEE;
    if (deadline && new Date() > new Date(deadline)) return json_({ ok: false, error: 'Registrations are closed.' });

    const c = (k, n) => clip_(d[k], n || 120);
    const rec = {
      name: c('name', 80), father: c('father', 80), dob: c('dob', 10),
      phone: c('phone', 15).replace(/\D/g, ''), email: c('email'),
      address: c('address', 300), village: c('village', 80), district: c('district', 60),
      role: c('role', 40), batting: c('batting', 40), bowlingArm: c('bowlingArm', 40), bowlingType: c('bowlingType', 40),
      utr: c('utr', 22).replace(/\s/g, '').toUpperCase()
    };

    if (!rec.name || !rec.father || !/^\d{4}-\d{2}-\d{2}$/.test(rec.dob) || !/^[6-9]\d{9}$/.test(rec.phone) ||
        !rec.address || !rec.village || !rec.district || !rec.role || !/^[A-Z0-9]{10,22}$/.test(rec.utr)) {
      return json_({ ok: false, error: 'Some required details are missing or invalid.' });
    }
    const files = d.files || {};
    for (const k of ['photo', 'aadhaar', 'payment']) {
      const f = files[k];
      if (!f || !f.data || ALLOWED_TYPES.indexOf(String(f.mimeType).toLowerCase()) < 0) {
        return json_({ ok: false, error: 'Please upload the photo, Aadhaar and payment screenshot (image or PDF).' });
      }
    }

    const sheet = getSheet_();
    // Duplicate UTR check
    const utrCol = HEADERS.indexOf('UTR number') + 1;
    if (sheet.getLastRow() > 1) {
      const used = sheet.getRange(2, utrCol, sheet.getLastRow() - 1, 1).getValues().map(r => String(r[0]).replace(/^'/, '').toUpperCase());
      if (used.indexOf(rec.utr) >= 0) return json_({ ok: false, error: 'This UTR number has already been used for a registration. Please check it, or contact the organisers.' });
    }

    const id = 'SCL-' + String(sheet.getLastRow()).padStart(4, '0');
    const when = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');
    const age = ageOn_(rec.dob);

    // Save files to the private Drive folder
    const folder = getFolder_();
    const safe = rec.name.replace(/[^A-Za-z0-9 ]/g, '').trim().replace(/\s+/g, '_').slice(0, 40) || 'player';
    const save = (f, label) => {
      const ext = (String(f.name).match(/\.[A-Za-z0-9]{2,5}$/) || [''])[0];
      return folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType, `${id}_${safe}_${label}${ext}`)).getUrl();
    };
    const photoUrl = save(files.photo, 'Photo');
    const aadhaarUrl = save(files.aadhaar, 'Aadhaar');
    const paymentUrl = save(files.payment, 'Payment');

    sheet.appendRow([
      id, when, rec.name, rec.father, rec.dob, age, rec.phone, rec.email, rec.address, rec.village, rec.district,
      rec.role, rec.batting, rec.bowlingArm, rec.bowlingType, rec.utr,
      photoUrl, aadhaarUrl, paymentUrl, 'Pending verification', ''
    ].map(safeCell_));

    // Email the organiser
    const rows = [
      ['Reg ID', id], ['Player', rec.name], ["Father's name", rec.father], ['DOB', rec.dob + ' (age ' + age + ')'],
      ['Mobile', rec.phone], ['Email', rec.email], ['Address', rec.address], ['Village / Town', rec.village],
      ['District', rec.district], ['Role', rec.role], ['Batting', rec.batting],
      ['Bowling', [rec.bowlingArm, rec.bowlingType].filter(String).join(' · ')],
      ['UTR', rec.utr], ['Submitted', when]
    ].filter(r => r[1]);
    MailApp.sendEmail({
      to: ORGANISER_EMAIL,
      replyTo: rec.email || ORGANISER_EMAIL.split(',')[0].trim(),
      subject: `🏏 ${id} — ${rec.name} (${rec.role}) — UTR ${rec.utr}`,
      htmlBody:
        `<h2 style="font-family:Arial;margin:0 0 12px">New player registration — ${esc_(CLUB_NAME)}</h2>
         <table style="font-family:Arial;font-size:14px;border-collapse:collapse">
         ${rows.map(r => `<tr><td style="padding:5px 14px 5px 0;color:#666;vertical-align:top">${esc_(r[0])}</td><td style="padding:5px 0"><b>${esc_(r[1])}</b></td></tr>`).join('')}
         </table>
         <p style="font-family:Arial;margin-top:14px">
           <a href="${photoUrl}">Photo</a> · <a href="${aadhaarUrl}">Aadhaar</a> · <a href="${paymentUrl}">Payment screenshot</a><br>
           <a href="https://wa.me/91${rec.phone}">WhatsApp ${rec.phone}</a> ·
           <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Open the sheet</a>
         </p>
         <p style="font-family:Arial;color:#888;font-size:12px">Check that ₹${fee} with UTR ${rec.utr} arrived in your bank/UPI app, then set Payment status to "Verified" in the sheet.</p>`
    });

    // Confirmation to the player (optional email)
    if (SEND_CONFIRMATION && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rec.email)) {
      MailApp.sendEmail({
        to: rec.email,
        replyTo: ORGANISER_EMAIL.split(',')[0].trim(),
        name: CLUB_NAME,
        subject: `Registration received — ${CLUB_NAME} ${SEASON} (${id})`,
        htmlBody:
          `<div style="font-family:Arial;font-size:15px;line-height:1.5">
             <p>Hi ${esc_(rec.name.split(' ')[0])},</p>
             <p>We've received your registration for <b>${esc_(CLUB_NAME)} ${SEASON}</b>.<br>
             Registration ID: <b>${id}</b><br>UTR: <b>${esc_(rec.utr)}</b></p>
             <p>Your payment will be verified and the organisers will contact you on ${esc_(rec.phone)}.</p>
             <p>See you on the field 🏏<br>${esc_(CLUB_NAME)}<br><a href="${INSTAGRAM_URL}">Instagram</a></p>
           </div>`
      });
    }

    return json_({ ok: true, id: id });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error — please try again.' });
  } finally {
    lock.releaseLock();
  }
}

// GET ?action=content → website content for the public site (no password: it's public anyway)
// Plain visit → status check
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'content') return json_({ ok: true, content: readContent_() });
  return json_({ ok: true, status: 'Registration endpoint is running' });
}

/* ---------- Admin (admin.html) ---------- */
function admin_(d) {
  const pass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!pass) return { ok: false, error: 'Admin password not set. Add ADMIN_PASSWORD in Apps Script → Project Settings → Script Properties.' };
  if (String(d.password || '') !== pass) { Utilities.sleep(1500); return { ok: false, error: 'Wrong password.' }; }

  if (d.action === 'login') return { ok: true };

  if (d.action === 'saveContent') {
    const content = d.content;
    if (!content || typeof content !== 'object') return { ok: false, error: 'Nothing to save.' };
    delete content.formEndpoint;                       // never stored — lives in data.js
    const text = JSON.stringify(content);
    if (text.length > 900000) return { ok: false, error: 'Content too large — use smaller images.' };
    writeContent_(text);
    return { ok: true, savedAt: Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM, hh:mm a') };
  }

  if (d.action === 'stats') {
    const sh = getSheet_(), n = Math.max(0, sh.getLastRow() - 1);
    const statusCol = HEADERS.indexOf('Payment status') + 1;
    const counts = {};
    if (n) sh.getRange(2, statusCol, n, 1).getValues().forEach(r => { counts[r[0]] = (counts[r[0]] || 0) + 1; });
    return { ok: true, total: n, counts: counts, sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl() };
  }
  return { ok: false, error: 'Unknown action.' };
}

/* ---------- Website content storage (a private JSON file in Drive) ---------- */
function readContent_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('content');
  if (hit) return JSON.parse(hit);
  const id = PropertiesService.getScriptProperties().getProperty('CONTENT_FILE_ID');
  if (!id) return null;
  try {
    const text = DriveApp.getFileById(id).getBlob().getDataAsString();
    if (text.length < 95000) cache.put('content', text, 600);
    return JSON.parse(text);
  } catch (e) { return null; }
}
function writeContent_(text) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CONTENT_FILE_ID');
  let file = null;
  if (id) { try { file = DriveApp.getFileById(id); } catch (e) {} }
  if (file) file.setContent(text);
  else props.setProperty('CONTENT_FILE_ID', DriveApp.createFile('SCL website content.json', text, 'application/json').getId());
  const cache = CacheService.getScriptCache();
  if (text.length < 95000) cache.put('content', text, 600); else cache.remove('content');
}

// Run once from the editor (▶ Run) to create the sheet tab + Drive folder and grant permissions
function setup() {
  getSheet_();
  Logger.log('Drive folder (private): ' + getFolder_().getUrl());
  CacheService.getScriptCache().remove('content');
  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD')) Logger.log('⚠️ Add ADMIN_PASSWORD under Project Settings → Script Properties to use admin.html');
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
}

/* ---------- helpers ---------- */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#070b14').setFontColor('#f3cf6b');
    sh.setFrozenRows(1);
    sh.setFrozenColumns(3);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pending verification', 'Verified', 'Rejected', 'Refunded']).build();
    sh.getRange(2, HEADERS.indexOf('Payment status') + 1, 2000, 1).setDataValidation(rule);
    // Keep mobile, DOB and UTR as plain text (no scientific notation / lost zeros)
    ['Mobile', 'Date of birth', 'UTR number'].forEach(h => sh.getRange(2, HEADERS.indexOf(h) + 1, 2000, 1).setNumberFormat('@'));
  }
  return sh;
}
function getFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const folder = DriveApp.createFolder(FOLDER_NAME);   // private by default — don't share it publicly
  props.setProperty('FOLDER_ID', folder.getId());
  return folder;
}
function ageOn_(dob) {
  const b = new Date(dob + 'T00:00:00'), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return isNaN(a) ? '' : a;
}
function clip_(v, n) { return String(v == null ? '' : v).trim().slice(0, n); }
// Stop spreadsheet formula injection (e.g. someone typing =HYPERLINK(...))
function safeCell_(v) { return /^[=+\-@]/.test(String(v)) ? "'" + v : v; }
function esc_(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
