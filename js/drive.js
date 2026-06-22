/**
 * drive.js — Google Apps Script integration + Drive image upload.
 *
 * Exposes: DriveClient.uploadDocx(blob, filename) → Promise<string> (Google Doc URL)
 *          DriveClient.uploadImage(file, eventName, slot) → Promise<string> (Sitecore path)
 *
 * Set APPS_SCRIPT_URL to your deployed Web App URL before use.
 */

const DriveClient = (() => {

  // Replace with your deployed Apps Script Web App URL
  const APPS_SCRIPT_URL = '';

  /* ── Sitecore image path convention ────────────────────────────────
   *
   * Library/Visuals/Resources/Events/{year}/{eventName}/{filename}
   */
  function siticorePath(eventName, filename) {
    const year = new Date().getFullYear();
    const slug = (eventName || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `Library/Visuals/Resources/Events/${year}/${slug}/${filename}`;
  }

  /* ── Upload .docx → Apps Script → Google Drive ──────────────────── */

  async function uploadDocx(blob, filename) {
    if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL not configured in drive.js');

    const base64 = await blobToBase64(blob);
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'uploadDocx', filename, base64 })
    });

    if (!resp.ok) throw new Error(`Apps Script error: ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    return json.url; // Google Doc URL
  }

  /* ── Upload image → Apps Script → Drive → return Sitecore path ──── */

  async function uploadImage(file, eventName) {
    if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL not configured in drive.js');

    const base64 = await blobToBase64(file);
    const path   = siticorePath(eventName, file.name);

    const resp = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'uploadImage',
        filename: file.name,
        mimeType: file.type,
        base64,
        sitecorePath: path
      })
    });

    if (!resp.ok) throw new Error(`Apps Script error: ${resp.status}`);
    const json = await resp.json();
    if (json.error) throw new Error(json.error);
    return path; // auto-populate Sitecore path in form
  }

  /* ── Helper ─────────────────────────────────────────────────────── */

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return { uploadDocx, uploadImage, siticorePath };

})();
