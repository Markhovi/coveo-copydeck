/**
 * app.js — orchestrator: navigation, state, wires form → docx → csv.
 *
 * Depends on (load order): schema.js, form.js, docx-builder.js,
 *                          csv-builder.js, drive.js
 */

(function () {

  /* ── State ───────────────────────────────────────────────────────── */

  let _eventData  = null;
  let _csvContent = '';

  /* ── Navigation ──────────────────────────────────────────────────── */

  /* ── Step transition helpers ─────────────────────────────────── */

  function animateStepIn(el, forward) {
    el.classList.add('active');
    el.style.opacity    = '0';
    el.style.transform  = `translateX(${forward ? 32 : -32}px)`;
    el.style.transition = 'none';
    // Double rAF ensures the browser has painted the initial state
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.36s ease, transform 0.36s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity    = '1';
      el.style.transform  = 'translateX(0)';
      setTimeout(() => { el.style.cssText = ''; }, 400);
    }));
  }

  function goStep(n) {
    const steps      = document.querySelectorAll('.step');
    const pills      = document.querySelectorAll('.step-pill');
    const current    = document.querySelector('.step.active');
    const currentIdx = current ? [...steps].indexOf(current) + 1 : 0;
    const next       = steps[n - 1];

    if (currentIdx === n) return;
    const forward = n > currentIdx;
    const OUT_MS  = 200;

    // Slide out current step
    if (current) {
      current.style.transition = `opacity ${OUT_MS}ms ease, transform ${OUT_MS}ms ease`;
      current.style.opacity    = '0';
      current.style.transform  = `translateX(${forward ? -28 : 28}px)`;
      setTimeout(() => {
        current.classList.remove('active');
        current.style.cssText = '';
        animateStepIn(next, forward);
      }, OUT_MS + 20);
    } else {
      animateStepIn(next, forward);
    }

    // Pills update immediately
    pills.forEach((p, i) => {
      p.classList.toggle('active', i + 1 === n);
      p.classList.toggle('done',   i + 1 < n);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Expose globally so inline onclick handlers in step HTML can call it
  window.goStep = goStep;

  /* ── Step-pill nav clicks ────────────────────────────────────────── */

  document.querySelectorAll('.step-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const n = parseInt(pill.dataset.step);
      // Only allow going back to step 1 freely;
      // forward steps require data to exist
      if (n === 1 || _eventData) goStep(n);
    });
  });

  /* ── saveAs helper ───────────────────────────────────────────────── */

  function saveAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  window.saveAs = saveAs; // used by CSV download button

  /* ── DOCX generation ─────────────────────────────────────────────── */

  async function generateDocx(ev) {
    const bytes = DocxBuilder.generate(ev);
    const blob  = new Blob(
      [bytes],
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
    const slug = (ev.itemName || 'copydeck').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    saveAs(blob, `copydeck-${slug}.docx`);
  }

  /* ── Event page preview (Step 2) ────────────────────────────────── */

  const TZ_SHORT = {
    'Eastern Standard Time':          'ET',
    'Central Standard Time':          'CT',
    'Pacific Standard Time':          'PT',
    'GMT Standard Time':              'GMT',
    'Central European Standard Time': 'CET'
  };

  function fmtDate(iso, showWeekday) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    const opts = { month: 'long', day: 'numeric', year: 'numeric' };
    if (showWeekday) opts.weekday = 'long';
    return d.toLocaleDateString('en-US', opts);
  }

  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return m ? `${hr}:${m.toString().padStart(2, '0')} ${ap}` : `${hr}:00 ${ap}`;
  }

  function iconCalendar() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  }
  function iconClock() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  }
  function iconPin() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
  function iconImage() {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
  }

  function renderEventPreview(ev) {
    const td  = ev.eventTimeAndDate   || {};
    const loc = ev.eventLocation      || {};
    const reg = ev.eventRegistration  || {};
    const msg = ev.eventStateMessages || {};
    const slug = (ev.itemName || 'copydeck').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    const filenameEl = document.getElementById('previewFilename');
    if (filenameEl) filenameEl.textContent = `copydeck-${slug}.docx`;

    const dateStr    = fmtDate(td.startDate, td.displayWeekday);
    const timeStr    = fmtTime(td.startTime);
    const tzStr      = td.displayEventTimeZone
      ? (td.displayGenericTimeZoneAbbreviation ? TZ_SHORT[td.timeZone] || '' : td.timeZone || '')
      : '';
    const endDateStr = fmtDate(td.endDate, false);
    const endTimeStr = fmtTime(td.endTime);

    const dateRange = (dateStr && endDateStr && td.endDate !== td.startDate)
      ? `${dateStr} — ${endDateStr}` : dateStr;
    const timeRange = timeStr
      ? (endTimeStr ? `${timeStr} – ${endTimeStr}` : timeStr) + (tzStr ? ' ' + tzStr : '')
      : '';

    // Hero visual: real image or glass-card placeholder
    const heroVisualHtml = ev.data?.heroImage
      ? `<img src="${escHtml(ev.data.heroImage)}" alt="" onerror="this.style.display='none'" />`
      : `${iconImage()}<span>Hero Image</span>`;

    // CTA label
    const regLabel = reg.registrationLabel || 'Register Now';

    // Content sections from widgets — 2-col layout (title left, desc right)
    let sectionsHtml = '';
    (ev.widgets || []).forEach(w => {
      const title = w.titleSection?.text?.trim();
      const desc  = w.descriptionSection?.text?.trim();
      if (!title && !desc) return;
      sectionsHtml += `<div class="ep-section">
  <div class="ep-section-title">${escHtml(title || '')}</div>
  <div class="ep-section-desc">${escHtml(desc || '')}</div>
</div>`;
    });

    if (!sectionsHtml) {
      sectionsHtml = `<div class="ep-sections-empty">
  <div class="ep-section-placeholder" style="width:40%"></div>
  <div class="ep-section-placeholder" style="width:70%"></div>
  <div class="ep-section-placeholder" style="width:55%"></div>
  <p style="margin-top:24px;color:#9ca3af;font-size:13px;text-align:center">
    Les sections de contenu (widgets) apparaîtront ici
  </p>
</div>`;
    }

    document.getElementById('eventPreview').innerHTML = `
<div class="ep-hero">
  <div class="ep-hero-content">
    ${ev.data?.pretitle ? `<div class="ep-pretitle">${escHtml(ev.data.pretitle)}</div>` : ''}
    <h1 class="ep-title">${escHtml(ev.data?.title || 'Event Title')}</h1>
    <div class="ep-meta-row">
      ${dateRange ? `<div class="ep-meta-item">${iconCalendar()} ${escHtml(dateRange)}</div>` : ''}
      ${timeRange ? `<div class="ep-meta-item">${iconClock()} ${escHtml(timeRange)}</div>` : ''}
      ${loc.location ? `<div class="ep-meta-item">${iconPin()} ${escHtml(loc.location)}</div>` : ''}
    </div>
    <div class="ep-hero-cta">${escHtml(regLabel)}</div>
  </div>
  <div class="ep-hero-visual">
    <div class="ep-hero-img">${heroVisualHtml}</div>
  </div>
</div>
<div class="ep-sections">${sectionsHtml}</div>`;
  }

  /* ── CSV rendering ───────────────────────────────────────────────── */

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderCSVPreview() {
    const s = CsvBuilder.stats(_csvContent, _eventData);

    document.getElementById('csvSummary').innerHTML = `
      <div class="csv-stat"><div class="stat-val">${s.items}</div><div class="stat-lbl">Items Sitecore</div></div>
      <div class="csv-stat"><div class="stat-val">${s.sections}</div><div class="stat-lbl">Content Sections</div></div>
      <div class="csv-stat"><div class="stat-val">${s.columns}</div><div class="stat-lbl">Colonnes CSV</div></div>
      <div class="csv-stat"><div class="stat-val">${s.lines}</div><div class="stat-lbl">Lignes totales</div></div>`;

    const [header, ...rest] = _csvContent.split('\n');
    document.getElementById('csvPreview').innerHTML =
      `<span style="color:#4A2B8C;font-weight:600;">${escHtml(header)}</span>\n` +
      rest.map(l => escHtml(l)).join('\n');
  }

  /* ── CSV download / copy ─────────────────────────────────────────── */

  window.downloadCSV = function () {
    if (!_csvContent) return;
    const blob = new Blob([_csvContent], { type: 'text/csv;charset=utf-8;' });
    const slug = (_eventData?.itemName || 'event').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    saveAs(blob, `sitecore-import-${slug}.csv`);
  };

  window.copyCSV = function () {
    if (!_csvContent) return;
    navigator.clipboard.writeText(_csvContent).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '✓ Copié';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copier';
        btn.classList.remove('copied');
      }, 2000);
    });
  };

  /* ── Form submit ─────────────────────────────────────────────────── */

  const form = document.getElementById('eventForm');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data = FormRenderer.collectData();
    if (!FormRenderer.validate(data)) {
      form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = document.getElementById('generateBtn');
    btn.textContent = 'Chargement…';
    btn.disabled    = true;

    try {
      _eventData  = data;
      _csvContent = CsvBuilder.generate(data);
      renderCSVPreview();
      renderEventPreview(data);
      goStep(2);
    } catch (err) {
      console.error(err);
      alert('Erreur : ' + err.message);
    } finally {
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg> Réviser maintenant`;
      btn.disabled = false;
    }
  });

  // Download .docx on demand from step 2
  window.downloadDocx = async function () {
    if (!_eventData) return;
    await generateDocx(_eventData);
  };

  // Expose for testing / external callers
  window.renderEventPreview = renderEventPreview;

  /* ── Theme switcher ─────────────────────────────────────────────── */

  (function () {
    const toggle  = document.getElementById('themeToggle');
    const buttons = toggle.querySelectorAll('.theme-opt');
    const saved   = localStorage.getItem('copydeck-theme') || 'coveo';

    function applyTheme(t) {
      document.body.classList.toggle('theme-forest', t === 'forest');
      localStorage.setItem('copydeck-theme', t);
      buttons.forEach(b => b.classList.toggle('active', b.dataset.theme === t));
    }

    applyTheme(saved);
    buttons.forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
  })();

  /* ── Boot ────────────────────────────────────────────────────────── */

  FormRenderer.init('eventForm', 2);

})();
