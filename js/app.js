/* ─── State ─────────────────────────────────────────── */
let widgetCount = 0;
let formData = null;
let csvContent = '';

/* ─── Navigation ─────────────────────────────────────── */
function goStep(n) {
  document.querySelectorAll('.step').forEach((s, i) => s.classList.toggle('active', i + 1 === n));
  document.querySelectorAll('.step-pill').forEach((p, i) => {
    p.classList.toggle('active', i + 1 === n);
    if (i + 1 < n) p.classList.add('done'); else p.classList.remove('done');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ─── Char counters ──────────────────────────────────── */
document.querySelectorAll('[data-counter]').forEach(el => {
  const max = parseInt(el.dataset.counter);
  const counter = el.parentElement.querySelector('.count');
  if (!counter) return;
  el.addEventListener('input', () => {
    const len = el.value.length;
    counter.textContent = len;
    counter.classList.toggle('over', len > max);
  });
});

/* ─── Registration behavior toggle ──────────────────── */
document.querySelectorAll('input[name="registrationBehavior"]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('extLinkField').style.display =
      r.value === 'External Registration' && r.checked ? 'block' : 'none';
  });
});

/* ─── Widgets ────────────────────────────────────────── */
function addWidget(data = {}) {
  widgetCount++;
  const idx = widgetCount;
  const n = data.contentSectionId || idx;
  const container = document.getElementById('widgets-body');

  const div = document.createElement('div');
  div.className = 'widget-block';
  div.id = `widget-${idx}`;

  const tPos = data.titleSection?.componentPosition || 'Left';
  const dPos = data.descriptionSection?.componentPosition || 'Right';
  const dWidth = data.descriptionSection?.componentWidth || '40%';

  div.innerHTML = `
    <div class="widget-block-header" onclick="toggleWidget(${idx})">
      <h4>Content Section ${n}</h4>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:12px;color:var(--gray-muted);">▾</span>
        <button type="button" class="widget-remove" onclick="removeWidget(event,${idx})" title="Supprimer">×</button>
      </div>
    </div>
    <div class="widget-block-body" id="wbody-${idx}">
      <div class="field-grid two-col" style="margin-bottom:16px;">
        <div class="field">
          <label>Titre de section <span class="char-hint">Rich text</span></label>
          <textarea name="w${idx}_title" rows="2">${data.titleSection?.text || ''}</textarea>
        </div>
        <div class="field">
          <label>Position du titre</label>
          <div class="position-group">
            <label class="position-opt">
              <input type="radio" name="w${idx}_titlePos" value="Left" ${tPos==='Left'?'checked':''} /> ← Left
            </label>
            <label class="position-opt">
              <input type="radio" name="w${idx}_titlePos" value="Right" ${tPos==='Right'?'checked':''} /> Right →
            </label>
          </div>
        </div>
      </div>
      <div class="field" style="margin-bottom:12px;">
        <label>Description / Texte <span class="char-hint">Rich text</span></label>
        <textarea name="w${idx}_desc" rows="3">${data.descriptionSection?.text || ''}</textarea>
      </div>
      <div class="field-grid two-col">
        <div class="field">
          <label>Position de la description</label>
          <div class="position-group">
            <label class="position-opt">
              <input type="radio" name="w${idx}_descPos" value="Left" ${dPos==='Left'?'checked':''} /> ← Left
            </label>
            <label class="position-opt">
              <input type="radio" name="w${idx}_descPos" value="Right" ${dPos==='Right'?'checked':''} /> Right →
            </label>
          </div>
        </div>
        <div class="field">
          <label>Largeur de la description</label>
          <div class="width-group">
            ${['40%','50%','60%','100%'].map(w => `
              <label class="width-opt">
                <input type="radio" name="w${idx}_descWidth" value="${w}" ${dWidth===w?'checked':''} /> ${w}
              </label>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  container.appendChild(div);
}

function toggleWidget(idx) {
  document.getElementById('wbody-' + idx).style.display =
    document.getElementById('wbody-' + idx).style.display === 'none' ? 'block' : 'none';
}

function removeWidget(e, idx) {
  e.stopPropagation();
  document.getElementById('widget-' + idx).remove();
}

document.getElementById('addWidgetBtn').addEventListener('click', () => addWidget());
addWidget();
addWidget();

/* ─── Collect form data ──────────────────────────────── */
function collectForm() {
  const f = document.getElementById('eventForm');
  const g = name => f.querySelector(`[name="${name}"]`);
  const v = name => g(name)?.value.trim() || '';
  const b = name => g(name)?.checked || false;
  const r = name => f.querySelector(`[name="${name}"]:checked`)?.value || '';

  const widgets = [];
  document.querySelectorAll('.widget-block').forEach((block, i) => {
    const idx = block.id.replace('widget-', '');
    widgets.push({
      contentSectionId: i + 1,
      titleSection: {
        text: f.querySelector(`[name="w${idx}_title"]`)?.value.trim() || '',
        componentPosition: f.querySelector(`[name="w${idx}_titlePos"]:checked`)?.value || 'Left'
      },
      descriptionSection: {
        text: f.querySelector(`[name="w${idx}_desc"]`)?.value.trim() || '',
        componentPosition: f.querySelector(`[name="w${idx}_descPos"]:checked`)?.value || 'Right',
        componentWidth: f.querySelector(`[name="w${idx}_descWidth"]:checked`)?.value || '40%'
      }
    });
  });

  return {
    event: {
      itemName: v('itemName'),
      itemPath: v('itemPath'),
      meta: {
        metaTitle: v('metaTitle'),
        metaDescription: v('metaDescription'),
        metaImage: v('metaImage')
      },
      data: {
        pretitle: v('pretitle'),
        title: v('title'),
        subtitle: v('subtitle'),
        thumbnailImage: v('thumbnailImage'),
        heroImage: v('heroImage')
      },
      eventTimeAndDate: {
        startDate: v('startDate'),
        startTime: v('startTime'),
        endDate: v('endDate'),
        endTime: v('endTime'),
        timeZone: v('timeZone'),
        displayWeekday: b('displayWeekday'),
        displayEventTimeZone: b('displayEventTimeZone'),
        displayGenericTimeZoneAbbreviation: b('displayGenericTimeZoneAbbreviation'),
        displayEventDuration: b('displayEventDuration')
      },
      eventLocation: {
        location: v('location'),
        directionLink: v('directionLink')
      },
      eventRegistration: {
        registrationBehavior: r('registrationBehavior'),
        externalRegistrationLink: v('externalRegistrationLink'),
        registrationLabel: v('registrationLabel'),
        overrideFormTitle: v('overrideFormTitle')
      },
      eventStateMessages: {
        eventInProgressMessage: v('eventInProgressMessage')
      },
      widgets
    }
  };
}

/* ─── Validate ───────────────────────────────────────── */
function validate(data) {
  const errors = [];
  if (!data.event.itemName) errors.push('itemName');
  if (!data.event.data.title) errors.push('title');
  document.querySelectorAll('input.error, textarea.error').forEach(el => el.classList.remove('error'));
  errors.forEach(name => {
    const el = document.querySelector(`[name="${name}"]`);
    if (el) el.classList.add('error');
  });
  return errors.length === 0;
}

/* ─── DOCX Generation ────────────────────────────────── */
async function generateDocx(data) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
          AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = docx;

  const ev = data.event;
  const PURPLE = '4A2B8C';
  const PURPLE_LIGHT = 'EDE9FB';
  const GRAY_HDR = '3D3D4E';
  const GRAY_ROW = 'F5F4FA';
  const BLUE_COL = 'D5E8F0';
  const WHITE = 'FFFFFF';
  const OPTION_COLOR = '6B46C1';
  const BORDER_COLOR = 'CCCCCC';

  const TABLE_W = 9360;
  const COL1 = 3400;
  const COL2 = 5960;

  const bd = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
  const borders = { top: bd, bottom: bd, left: bd, right: bd };

  function makeCell(children, fill = WHITE, width = COL2) {
    return new TableCell({
      borders, width: { size: width, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 140, right: 140 },
      children
    });
  }

  function headerRow(label) {
    return new TableRow({ children: [new TableCell({
      borders, columnSpan: 2,
      width: { size: TABLE_W, type: WidthType.DXA },
      shading: { fill: GRAY_HDR, type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: 'FFFFFF', size: 22, font: 'Arial' })] })]
    })] });
  }

  function colHeader() {
    return new TableRow({ children: [
      makeCell([new Paragraph({ children: [new TextRun({ text: 'Nom du champ (Lisible)', bold: true, size: 20, font: 'Arial' })] })], BLUE_COL, COL1),
      makeCell([new Paragraph({ children: [new TextRun({ text: 'Valeur (Contenu)', bold: true, size: 20, font: 'Arial' })] })], BLUE_COL, COL2)
    ]});
  }

  function fieldRow(label, value, options = null) {
    const labelRuns = [new TextRun({ text: label, bold: true, size: 20, font: 'Arial', color: '222222' })];
    if (options) {
      const opts = options.split('|');
      labelRuns.push(new TextRun({ text: 'Options : ', italic: true, size: 17, color: '888888', font: 'Arial', break: 1 }));
      opts.forEach((o, i) => {
        labelRuns.push(new TextRun({ text: o.trim(), italic: true, bold: true, size: 17, color: OPTION_COLOR, font: 'Arial' }));
        if (i < opts.length - 1) labelRuns.push(new TextRun({ text: ' │ ', italic: true, size: 17, color: 'AAAAAA', font: 'Arial' }));
      });
    }
    const valStr = value === undefined || value === null ? '' : String(value);
    return new TableRow({ children: [
      makeCell([new Paragraph({ children: labelRuns, spacing: { before: 60, after: 60 } })], GRAY_ROW, COL1),
      makeCell([new Paragraph({ children: [new TextRun({ text: valStr, size: 20, font: 'Arial', color: valStr ? '111111' : 'CCCCCC' })], spacing: { before: 60, after: 60 } })], WHITE, COL2)
    ]});
  }

  const rows = [];

  rows.push(headerRow('Identification'));
  rows.push(colHeader());
  rows.push(fieldRow('Nom de l\'événement', ev.itemName));
  rows.push(fieldRow('Chemin de publication', ev.itemPath));

  rows.push(headerRow('Meta Data (SEO)'));
  rows.push(colHeader());
  rows.push(fieldRow('Titre SEO (Meta)', ev.meta.metaTitle));
  rows.push(fieldRow('Description SEO (Meta)', ev.meta.metaDescription));
  rows.push(fieldRow('Image SEO (Meta)', ev.meta.metaImage));

  rows.push(headerRow('Data'));
  rows.push(colHeader());
  rows.push(fieldRow('Surtitre', ev.data.pretitle));
  rows.push(fieldRow('Titre principal', ev.data.title));
  rows.push(fieldRow('Sous-titre', ev.data.subtitle));
  rows.push(fieldRow('Image miniature (Thumbnail)', ev.data.thumbnailImage));
  rows.push(fieldRow('Image principale (Hero)', ev.data.heroImage));

  rows.push(headerRow('Event Time and Date'));
  rows.push(colHeader());
  rows.push(fieldRow('Date de début', ev.eventTimeAndDate.startDate));
  rows.push(fieldRow('Heure de début', ev.eventTimeAndDate.startTime));
  rows.push(fieldRow('Date de fin', ev.eventTimeAndDate.endDate));
  rows.push(fieldRow('Heure de fin', ev.eventTimeAndDate.endTime));
  rows.push(fieldRow('Fuseau horaire', ev.eventTimeAndDate.timeZone,
    'Eastern Standard Time | Central Standard Time | Pacific Standard Time | GMT Standard Time | Central European Standard Time'));
  rows.push(fieldRow('Afficher le jour de la semaine', ev.eventTimeAndDate.displayWeekday, 'true | false'));
  rows.push(fieldRow('Afficher le fuseau horaire', ev.eventTimeAndDate.displayEventTimeZone, 'true | false'));
  rows.push(fieldRow('Afficher l\'abréviation du fuseau', ev.eventTimeAndDate.displayGenericTimeZoneAbbreviation, 'true | false'));
  rows.push(fieldRow('Afficher la durée de l\'événement', ev.eventTimeAndDate.displayEventDuration, 'true | false'));

  rows.push(headerRow('Event Location'));
  rows.push(colHeader());
  rows.push(fieldRow('Adresse / Lieu', ev.eventLocation.location));
  rows.push(fieldRow('Lien d\'itinéraire (Maps)', ev.eventLocation.directionLink));

  rows.push(headerRow('Event Registration'));
  rows.push(colHeader());
  rows.push(fieldRow('Type d\'inscription', ev.eventRegistration.registrationBehavior, 'Page with form | External Registration'));
  rows.push(fieldRow('Lien d\'inscription externe', ev.eventRegistration.externalRegistrationLink));
  rows.push(fieldRow('Texte du bouton d\'inscription', ev.eventRegistration.registrationLabel));
  rows.push(fieldRow('Titre personnalisé du formulaire', ev.eventRegistration.overrideFormTitle));

  rows.push(headerRow('Event State Messages'));
  rows.push(colHeader());
  rows.push(fieldRow('Message de l\'événement en cours', ev.eventStateMessages.eventInProgressMessage));

  ev.widgets.forEach((w, i) => {
    const n = w.contentSectionId || (i + 1);
    rows.push(headerRow(`Widget — Content Section ${n}`));
    rows.push(colHeader());
    rows.push(fieldRow(`Widget ${n} - Titre de section`, w.titleSection.text));
    rows.push(fieldRow(`Widget ${n} - Position du titre`, w.titleSection.componentPosition, 'Left | Right'));
    rows.push(fieldRow(`Widget ${n} - Description / Texte`, w.descriptionSection.text));
    rows.push(fieldRow(`Widget ${n} - Position de la description`, w.descriptionSection.componentPosition, 'Left | Right'));
    rows.push(fieldRow(`Widget ${n} - Largeur de la description`, w.descriptionSection.componentWidth, '40% | 50% | 60% | 100%'));
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
      },
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'Template de Configuration d\'Événement', bold: true, size: 36, color: 'FFFFFF', font: 'Arial' })],
          shading: { fill: PURPLE, type: ShadingType.CLEAR },
          spacing: { before: 0, after: 0 },
          indent: { left: 200, right: 200 }
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Copy Deck  —  ' + (ev.itemName || 'Sans titre'), size: 22, color: 'C4B5FD', font: 'Arial' })],
          shading: { fill: PURPLE, type: ShadingType.CLEAR },
          spacing: { before: 0, after: 280 },
          indent: { left: 200, right: 200 }
        }),
        new Table({ width: { size: TABLE_W, type: WidthType.DXA }, columnWidths: [COL1, COL2], rows })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const name = (ev.itemName || 'copydeck').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  saveAs(blob, `copydeck-${name}.docx`);
}

/* ─── CSV Generation ─────────────────────────────────── */
function generateCSV(data) {
  const ev = data.event;
  const basePath = (ev.itemPath || '').replace(/\/$/, '') + '/' + ev.itemName;
  const T_EVENT = '/sitecore/templates/Feature/Resources/Resource/Resource Event/Resource Event Self Serve';
  const T_WIDGETS = '/sitecore/templates/Project/Widgets/Widgets';
  const T_LAYOUT = '/sitecore/templates/Project/Widgets/Layout Container';
  const T_TEXT = '/sitecore/templates/Project/Widgets/Text';

  const headers = ['ID','ItemName','ItemPath','TemplateName',
    'MetaTitle','MetaDescription','MetaImage',
    'Pretitle','Title','Subtitle','ThumbnailImage','HeroImage',
    'EventStartDate','EventStartTime','EventEndDate','EventEndTime',
    'EventTimeZone','DisplayWeekday','DisplayEventTimeZone',
    'DisplayGenericTimeZoneAbbreviation','DisplayEventDuration',
    'EventLocation','DirectionLink',
    'RegistrationBehavior','ExternalRegistrationLink','RegistrationLabel','OverrideFormTitle',
    'EventInProgressMessage',
    'WidgetText','ComponentPosition','ComponentWidth'];

  const esc = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
  const empty = () => Array(headers.length - 4).fill(esc(''));

  const rows = [headers.join(',')];

  // Event item
  rows.push([
    esc(''), esc(ev.itemName), esc(basePath), esc(T_EVENT),
    esc(ev.meta.metaTitle), esc(ev.meta.metaDescription), esc(ev.meta.metaImage),
    esc(ev.data.pretitle), esc(ev.data.title), esc(ev.data.subtitle),
    esc(ev.data.thumbnailImage), esc(ev.data.heroImage),
    esc(ev.eventTimeAndDate.startDate), esc(ev.eventTimeAndDate.startTime),
    esc(ev.eventTimeAndDate.endDate), esc(ev.eventTimeAndDate.endTime),
    esc(ev.eventTimeAndDate.timeZone),
    esc(ev.eventTimeAndDate.displayWeekday),
    esc(ev.eventTimeAndDate.displayEventTimeZone),
    esc(ev.eventTimeAndDate.displayGenericTimeZoneAbbreviation),
    esc(ev.eventTimeAndDate.displayEventDuration),
    esc(ev.eventLocation.location), esc(ev.eventLocation.directionLink),
    esc(ev.eventRegistration.registrationBehavior),
    esc(ev.eventRegistration.externalRegistrationLink),
    esc(ev.eventRegistration.registrationLabel),
    esc(ev.eventRegistration.overrideFormTitle),
    esc(ev.eventStateMessages.eventInProgressMessage),
    esc(''), esc(''), esc('')
  ].join(','));

  // Widgets container
  rows.push([esc(''), esc('Widgets'), esc(basePath+'/Widgets'), esc(T_WIDGETS), ...empty()].join(','));

  ev.widgets.forEach((w, i) => {
    const n = w.contentSectionId || (i + 1);
    const csPath = basePath + '/Widgets/Content Section ' + n;
    rows.push([esc(''), esc('Content Section '+n), esc(csPath), esc(T_LAYOUT), ...empty()].join(','));
    rows.push([
      esc(''), esc('Title Section '+n), esc(csPath+'/Title Section '+n), esc(T_TEXT),
      ...Array(headers.length - 7).fill(esc('')),
      esc(w.titleSection.text), esc(w.titleSection.componentPosition), esc('')
    ].join(','));
    rows.push([
      esc(''), esc('Description Section '+n), esc(csPath+'/Description Section '+n), esc(T_TEXT),
      ...Array(headers.length - 7).fill(esc('')),
      esc(w.descriptionSection.text), esc(w.descriptionSection.componentPosition), esc(w.descriptionSection.componentWidth)
    ].join(','));
  });

  return rows.join('\n');
}

/* ─── Form submit ────────────────────────────────────── */
document.getElementById('eventForm').addEventListener('submit', async e => {
  e.preventDefault();
  formData = collectForm();
  if (!validate(formData)) {
    document.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const btn = document.getElementById('generateBtn');
  btn.textContent = 'Génération en cours…';
  btn.disabled = true;
  try {
    await generateDocx(formData);
    csvContent = generateCSV(formData);
    renderCSVPreview();
    goStep(2);
  } catch (err) {
    console.error(err);
    alert('Erreur lors de la génération du .docx : ' + err.message);
  } finally {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Générer le Copydeck (.docx)';
    btn.disabled = false;
  }
});

/* ─── CSV preview ────────────────────────────────────── */
function renderCSVPreview() {
  const lines = csvContent.split('\n');
  const ev = formData.event;
  const widgetItems = ev.widgets.length * 3 + 1;
  const totalItems = 1 + widgetItems;

  document.getElementById('csvSummary').innerHTML = `
    <div class="csv-stat"><div class="stat-val">${totalItems}</div><div class="stat-lbl">Items Sitecore</div></div>
    <div class="csv-stat"><div class="stat-val">${ev.widgets.length}</div><div class="stat-lbl">Content Sections</div></div>
    <div class="csv-stat"><div class="stat-val">${lines[0].split(',').length}</div><div class="stat-lbl">Colonnes CSV</div></div>
    <div class="csv-stat"><div class="stat-val">${lines.length}</div><div class="stat-lbl">Lignes totales</div></div>`;

  const preview = document.getElementById('csvPreview');
  const [header, ...rest] = lines;
  preview.innerHTML =
    `<span style="color:#4A2B8C;font-weight:600;">${escHtml(header)}</span>\n` +
    rest.map(l => escHtml(l)).join('\n');
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ─── CSV download ───────────────────────────────────── */
function downloadCSV() {
  if (!csvContent) return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const name = (formData?.event?.itemName || 'event').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  saveAs(blob, `sitecore-import-${name}.csv`);
}

function copyCSV() {
  navigator.clipboard.writeText(csvContent).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Copié';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 2000);
  });
}
