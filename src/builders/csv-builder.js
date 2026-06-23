/**
 * builders/csv-builder.js — generates the Sitecore Item Import CSV.
 *
 * Depends on: SCHEMA from src/schema/index.js
 * Exposes:    CsvBuilder.generate(eventData) → string (CSV text)
 *             CsvBuilder.stats(csvString, eventData) → { items, sections, columns, lines }
 */

import { SCHEMA } from '../schema/index.js'

/* ── Sitecore lookup GUIDs ──────────────────────────────────────── */

const TIMEZONE_GUIDS = {
  'Eastern Standard Time':          '{52C7AF24-DC3E-4944-824D-3143BE8FDF1B}',
  'Central Standard Time':          '{3DAB6A2C-D86B-4CDB-A5AD-D7E3F60C217D}',
  'Pacific Standard Time':          '{B2AD42BC-ABD7-45C8-B7CB-50B360BBA027}',
  'GMT Standard Time':              '{46B177E4-3D4F-4B7D-B767-3401BBECB8F7}',
  'Central European Standard Time': '{F3D4E74A-024A-483E-986D-EDBB7BF8FE37}',
}

const REGISTRATION_GUIDS = {
  'Page with form':        '{14060640-B890-4D65-81E2-4F36A53857FB}',
  'External Registration': '{F4882C64-8743-44C7-B85C-6667FA3FD4CC}',
}

/* ── Value formatters ───────────────────────────────────────────── */

// "2026-06-16" + "14:30" → "20260616T143000Z"
function scDate(date, time) {
  if (!date) return ''
  const d = date.replace(/-/g, '')
  const t = time ? time.replace(':', '') + '00' : '000000'
  return `${d}T${t}Z`
}

// true / "true" / 1 / "1" → "1", anything else → ""
function scBool(val) {
  return (val === true || val === 'true' || val === 1 || val === '1') ? '1' : ''
}

/* ── CSV escaping ───────────────────────────────────────────────── */

function q(v) {
  return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'
}

/* ── Build a full CSV row aligned to SCHEMA.csvColumns ─────────── */

function makeRow(overrides) {
  return SCHEMA.csvColumns
    .map(col => q(overrides[col] ?? ''))
    .join(',')
}

/* ── Public API ─────────────────────────────────────────────────── */

export const CsvBuilder = {
  generate(ev) {
    const T = SCHEMA.templates
    const basePath = (ev.itemPath || '').replace(/\/$/, '') + '/' + ev.itemName

    const lines = []

    // Header row
    lines.push(SCHEMA.csvColumns.join(','))

    // ── Event parent item ────────────────────────────────────────────
    lines.push(makeRow({
      ID:           '',
      ItemName:     ev.itemName,
      ItemPath:     basePath,
      TemplateName: T.event,

      MetaTitle:       ev.meta?.metaTitle,
      MetaDescription: ev.meta?.metaDescription,
      MetaImage:       ev.meta?.metaImage,

      Pretitle:       ev.data?.pretitle,
      Title:          ev.data?.title,
      Subtitle:       ev.data?.subtitle,
      ThumbnailImage: ev.data?.thumbnailImage,
      HeroImage:      ev.data?.heroImage,

      EventStartDate: scDate(ev.eventTimeAndDate?.startDate, ev.eventTimeAndDate?.startTime),
      EventStartTime: '',
      EventEndDate:   scDate(ev.eventTimeAndDate?.endDate,   ev.eventTimeAndDate?.endTime),
      EventEndTime:   '',
      EventTimeZone:  TIMEZONE_GUIDS[ev.eventTimeAndDate?.timeZone] || ev.eventTimeAndDate?.timeZone || '',

      DisplayWeekday:                     scBool(ev.eventTimeAndDate?.displayWeekday),
      DisplayEventTimeZone:               scBool(ev.eventTimeAndDate?.displayEventTimeZone),
      DisplayGenericTimeZoneAbbreviation: scBool(ev.eventTimeAndDate?.displayGenericTimeZoneAbbreviation),
      DisplayEventDuration:               scBool(ev.eventTimeAndDate?.displayEventDuration),

      EventLocation:  ev.eventLocation?.location,
      DirectionLink:  ev.eventLocation?.directionLink,

      RegistrationBehavior:     REGISTRATION_GUIDS[ev.eventRegistration?.registrationBehavior] || ev.eventRegistration?.registrationBehavior || '',
      ExternalRegistrationLink: ev.eventRegistration?.externalRegistrationLink,
      RegistrationLabel:        ev.eventRegistration?.registrationLabel,
      OverrideFormTitle:        ev.eventRegistration?.overrideFormTitle,

      EventInProgressMessage: ev.eventStateMessages?.eventInProgressMessage
    }))

    // ── Widgets container ────────────────────────────────────────────
    lines.push(makeRow({
      ItemName:     'Widgets',
      ItemPath:     basePath + '/Widgets',
      TemplateName: T.widgets
    }))

    // ── Per-widget rows ──────────────────────────────────────────────
    ;(ev.widgets || []).forEach((w, i) => {
      const n      = w.contentSectionId || (i + 1)
      const csPath = basePath + '/Widgets/Content Section ' + n

      // Layout container
      lines.push(makeRow({
        ItemName:     'Content Section ' + n,
        ItemPath:     csPath,
        TemplateName: T.layout
      }))

      // Title Section
      lines.push(makeRow({
        ItemName:          'Title Section ' + n,
        ItemPath:          csPath + '/Title Section ' + n,
        TemplateName:      T.text,
        WidgetText:        w.titleSection?.text,
        ComponentPosition: w.titleSection?.componentPosition
      }))

      // Description Section
      lines.push(makeRow({
        ItemName:          'Description Section ' + n,
        ItemPath:          csPath + '/Description Section ' + n,
        TemplateName:      T.text,
        WidgetText:        w.descriptionSection?.text,
        ComponentPosition: w.descriptionSection?.componentPosition
      }))
    })

    return lines.join('\n')
  },

  stats(csv, ev) {
    const lines    = csv.split('\n')
    const sections = (ev.widgets || []).length
    return {
      items:    1 + 1 + sections * 3,   // event + widgets container + 3 rows/widget
      sections,
      columns:  SCHEMA.csvColumns.length,
      lines:    lines.length
    }
  }
}
