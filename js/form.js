/**
 * form.js — renders the event form dynamically from SCHEMA.
 *
 * Depends on: schema.js (must load first)
 * Exposes:    FormRenderer.init(containerId)
 *             FormRenderer.collectData() → event object
 *             FormRenderer.validate(data) → boolean
 */

const FormRenderer = (() => {

  let _container = null;
  let _widgetCount = 0;

  /* ── Helpers ────────────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function labelHtml(field) {
    const reqBadge = field.required ? ' <span class="req">requis</span>' : '';
    const hint = field.charHint
      ? ` <span class="char-hint">${esc(field.charHint)}</span>`
      : field.hint
        ? ` <span class="char-hint">${esc(field.hint)}</span>`
        : '';
    return `<label>${esc(field.label)}${reqBadge}${hint}</label>`;
  }

  /* ── Field renderers ─────────────────────────────────────────────── */

  function renderText(name, field) {
    const maxAttr = field.maxLength ? ` maxlength="${field.maxLength}"` : '';
    const counterAttr = field.maxLength ? ` data-counter="${field.maxLength}"` : '';
    const phAttr = field.placeholder ? ` placeholder="${esc(field.placeholder)}"` : '';
    const reqAttr = field.required ? ' required' : '';
    const defVal = field.default ? esc(field.default) : '';
    const typeAttr = field.type === 'url' ? 'url' : 'text';
    let html = `${labelHtml(field)}
<input type="${typeAttr}" name="${name}"${maxAttr}${counterAttr}${phAttr}${reqAttr} value="${defVal}" />`;
    if (field.maxLength) {
      html += `\n<div class="char-counter"><span class="count">0</span>/${field.maxLength}</div>`;
    }
    return html;
  }

  function renderTextarea(name, field) {
    const maxAttr = field.maxLength ? ` maxlength="${field.maxLength}"` : '';
    const counterAttr = field.maxLength ? ` data-counter="${field.maxLength}"` : '';
    const reqAttr = field.required ? ' required' : '';
    const rows = field.rows || 3;
    const defVal = field.default ? esc(field.default) : '';
    let html = `${labelHtml(field)}
<textarea name="${name}" rows="${rows}"${maxAttr}${counterAttr}${reqAttr}>${defVal}</textarea>`;
    if (field.maxLength) {
      html += `\n<div class="char-counter"><span class="count">0</span>/${field.maxLength}</div>`;
    }
    return html;
  }

  function renderSelect(name, field) {
    const opts = (field.options || []).map(o =>
      `<option value="${esc(o.value)}">${esc(o.label)}</option>`
    ).join('');
    return `${labelHtml(field)}<select name="${name}">${opts}</select>`;
  }

  function renderRadio(name, field) {
    const opts = (field.options || []).map((o, i) => {
      const checked = (field.default === o.value || i === 0) ? ' checked' : '';
      return `<label class="radio-opt">
  <input type="radio" name="${name}" value="${esc(o.value)}"${checked} />
  <span>${esc(o.label)}</span>
</label>`;
    }).join('\n');
    return `${labelHtml(field)}<div class="radio-group">${opts}</div>`;
  }

  function renderToggle(name, field) {
    const checked = field.default ? ' checked' : '';
    return `<label class="toggle-field">
  <span class="toggle-label">${esc(field.label)}</span>
  <input type="checkbox" name="${name}" role="switch"${checked} />
  <span class="toggle-track"><span class="toggle-thumb"></span></span>
</label>`;
  }

  function renderPosition(name, defVal) {
    const l = defVal === 'Left' ? ' checked' : '';
    const r = defVal === 'Right' ? ' checked' : '';
    return `<div class="position-group">
  <label class="position-opt">
    <input type="radio" name="${name}" value="Left"${l} /> ← Left
  </label>
  <label class="position-opt">
    <input type="radio" name="${name}" value="Right"${r} /> Right →
  </label>
</div>`;
  }

  function renderField(name, field) {
    switch (field.type) {
      case 'textarea': return renderTextarea(name, field);
      case 'select':   return renderSelect(name, field);
      case 'radio':    return renderRadio(name, field);
      case 'toggle':   return renderToggle(name, field);
      case 'date':
      case 'time':
        return `${labelHtml(field)}<input type="${field.type}" name="${name}" />`;
      case 'text':
      case 'url':
      default:
        return renderText(name, field);
    }
  }

  /* ── Section rendering ───────────────────────────────────────────── */

  function renderRow(row) {
    if (row.cols === 'toggles') {
      const toggles = row.fields.map(key => {
        const f = SCHEMA.fields[key];
        return renderToggle(key, f);
      }).join('\n');
      return `<div class="toggles-grid">${toggles}</div>`;
    }

    const colClass = row.cols === 3 ? 'three-col' : row.cols === 2 ? 'two-col' : '';
    const wrapStart = colClass ? `<div class="field-grid ${colClass}">` : '';
    const wrapEnd  = colClass ? '</div>' : '';

    const fields = row.fields.map(key => {
      const f = SCHEMA.fields[key];
      if (!f) return '';
      const conditional = f.showWhen
        ? ` id="field-${key}" style="display:none"` : ` id="field-${key}"`;
      return `<div class="field"${conditional}>${renderField(key, f)}</div>`;
    }).join('\n');

    return wrapStart + fields + wrapEnd;
  }

  function renderSection(section) {
    const rows = section.rows.map(renderRow).join('\n');
    return `<div class="form-card" id="card-${section.id}">
  <div class="card-header">
    <span><span class="card-icon">${section.icon}</span> ${esc(section.label)}</span>
  </div>
  <div class="card-body">${rows}</div>
</div>`;
  }

  /* ── Widget block rendering ──────────────────────────────────────── */

  function renderWidgetBlock(idx, data = {}) {
    const n = data.contentSectionId || idx;
    const titleText = data.titleSection?.text || '';
    const titlePos  = data.titleSection?.componentPosition || 'Left';
    const descText  = data.descriptionSection?.text || '';
    const descPos   = data.descriptionSection?.componentPosition || 'Right';

    return `<div class="widget-block" id="widget-${idx}">
  <div class="widget-block-header" onclick="FormRenderer._toggleWidget(${idx})">
    <h4>Content Section ${n}</h4>
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:12px;color:var(--gray-muted);">▾</span>
      <button type="button" class="widget-remove"
        onclick="FormRenderer._removeWidget(event,${idx})" title="Supprimer">×</button>
    </div>
  </div>
  <div class="widget-block-body" id="wbody-${idx}">
    <div class="field-grid two-col" style="margin-bottom:16px;">
      <div class="field">
        <label>Titre de section <span class="req">requis</span> <span class="char-hint">Rich text</span></label>
        <textarea name="w${idx}_title" rows="2">${esc(titleText)}</textarea>
      </div>
      <div class="field">
        <label>Position du titre</label>
        ${renderPosition(`w${idx}_titlePos`, titlePos)}
      </div>
    </div>
    <div class="field">
      <label>Description / Texte <span class="req">requis</span> <span class="char-hint">Rich text</span></label>
      <textarea name="w${idx}_desc" rows="3">${esc(descText)}</textarea>
    </div>
    <div class="field" style="margin-top:12px;">
      <label>Position de la description</label>
      ${renderPosition(`w${idx}_descPos`, descPos)}
    </div>
  </div>
</div>`;
  }

  /* ── Widgets card ────────────────────────────────────────────────── */

  function renderWidgetsCard() {
    return `<div class="form-card" id="card-widgets">
  <div class="card-header">
    <span><span class="card-icon">🧩</span> Widgets — Content Sections</span>
    <button type="button" class="btn-add-widget" id="addWidgetBtn">+ Ajouter une section</button>
  </div>
  <div class="card-body" id="widgets-body"></div>
</div>`;
  }

  /* ── Submit button ───────────────────────────────────────────────── */

  function renderFormActions() {
    return `<div class="form-actions">
  <button type="submit" class="btn-primary btn-lg" id="generateBtn">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 18l6-6-6-6"/>
    </svg>
    Réviser maintenant
  </button>
</div>`;
  }

  /* ── Event wiring ────────────────────────────────────────────────── */

  function wireCharCounters() {
    _container.querySelectorAll('[data-counter]').forEach(el => {
      const max = parseInt(el.dataset.counter);
      const counter = el.parentElement.querySelector('.count');
      if (!counter) return;
      el.addEventListener('input', () => {
        const len = el.value.length;
        counter.textContent = len;
        counter.classList.toggle('over', len > max);
      });
    });
  }

  function wireConditionals() {
    Object.entries(SCHEMA.fields).forEach(([key, field]) => {
      if (!field.showWhen) return;
      const { field: watchKey, value: showValue } = field.showWhen;
      const wrapper = document.getElementById(`field-${key}`);
      if (!wrapper) return;

      function update() {
        const checked = _container.querySelector(`[name="${watchKey}"]:checked`);
        const current = checked ? checked.value : '';
        wrapper.style.display = current === showValue ? '' : 'none';
      }

      _container.querySelectorAll(`[name="${watchKey}"]`).forEach(el =>
        el.addEventListener('change', update)
      );
      update();
    });
  }

  function wireAddWidget() {
    document.getElementById('addWidgetBtn')
      ?.addEventListener('click', () => _addWidget());
  }

  /* ── Public widget helpers (called from inline onclick) ─────────── */

  function _addWidget(data = {}) {
    _widgetCount++;
    const body = document.getElementById('widgets-body');
    if (!body) return;
    body.insertAdjacentHTML('beforeend', renderWidgetBlock(_widgetCount, data));
  }

  function _toggleWidget(idx) {
    const body = document.getElementById(`wbody-${idx}`);
    if (body) body.style.display = body.style.display === 'none' ? '' : 'none';
  }

  function _removeWidget(e, idx) {
    e.stopPropagation();
    document.getElementById(`widget-${idx}`)?.remove();
  }

  /* ── Data collection ─────────────────────────────────────────────── */

  function collectData() {
    const f = _container;
    const v  = name => f.querySelector(`[name="${name}"]`)?.value.trim() || '';
    const b  = name => f.querySelector(`[name="${name}"]`)?.checked || false;
    const r  = name => f.querySelector(`[name="${name}"]:checked`)?.value || '';

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
          componentPosition: f.querySelector(`[name="w${idx}_descPos"]:checked`)?.value || 'Right'
        }
      });
    });

    return {
      itemName: v('itemName'),
      itemPath: v('itemPath'),
      meta: {
        metaTitle:       v('metaTitle'),
        metaDescription: v('metaDescription'),
        metaImage:       v('metaImage')
      },
      data: {
        pretitle:       v('pretitle'),
        title:          v('title'),
        subtitle:       v('subtitle'),
        thumbnailImage: v('thumbnailImage'),
        heroImage:      v('heroImage')
      },
      eventTimeAndDate: {
        startDate:   v('startDate'),
        startTime:   v('startTime'),
        endDate:     v('endDate'),
        endTime:     v('endTime'),
        timeZone:    v('timeZone'),
        displayWeekday:                      b('displayWeekday'),
        displayEventTimeZone:                b('displayEventTimeZone'),
        displayGenericTimeZoneAbbreviation:  b('displayGenericTimeZoneAbbreviation'),
        displayEventDuration:                b('displayEventDuration')
      },
      eventLocation: {
        location:      v('location'),
        directionLink: v('directionLink')
      },
      eventRegistration: {
        registrationBehavior:      r('registrationBehavior'),
        externalRegistrationLink:  v('externalRegistrationLink'),
        registrationLabel:         v('registrationLabel'),
        overrideFormTitle:         v('overrideFormTitle')
      },
      eventStateMessages: {
        eventInProgressMessage: v('eventInProgressMessage')
      },
      widgets
    };
  }

  /* ── Validation ──────────────────────────────────────────────────── */

  function validate(data) {
    _container.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    const errors = [];

    const requiredFields = ['itemName', 'metaTitle', 'metaDescription',
      'startDate', 'endDate', 'startTime', 'endTime', 'timeZone'];
    requiredFields.forEach(name => {
      const el = _container.querySelector(`[name="${name}"]`);
      if (!el || !el.value.trim()) {
        errors.push(name);
        if (el) el.classList.add('error');
      }
    });

    // At least one widget must have both title and description filled
    const widgets = data.widgets || [];
    const hasValidWidget = widgets.some(
      w => w.titleSection?.text?.trim() && w.descriptionSection?.text?.trim()
    );
    if (!hasValidWidget) {
      const firstBody = _container.querySelector('.widget-block-body');
      if (firstBody) firstBody.querySelectorAll('textarea').forEach(ta => ta.classList.add('error'));
      errors.push('widget');
    }

    return errors.length === 0;
  }

  /* ── Init ────────────────────────────────────────────────────────── */

  function init(formId, defaultWidgetCount = 2) {
    _container = document.getElementById(formId);
    if (!_container) throw new Error(`Form container #${formId} not found`);

    // Render all schema sections
    const sectionsHtml = SCHEMA.sections.map(renderSection).join('\n');
    const widgetsHtml  = renderWidgetsCard();
    const actionsHtml  = renderFormActions();

    _container.innerHTML = sectionsHtml + widgetsHtml + actionsHtml;

    // Wire interactivity
    wireCharCounters();
    wireConditionals();
    wireAddWidget();

    // Add default widgets
    for (let i = 0; i < defaultWidgetCount; i++) _addWidget();
  }

  return { init, collectData, validate, _addWidget, _toggleWidget, _removeWidget };

})();
