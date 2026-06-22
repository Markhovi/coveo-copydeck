/**
 * builders/csv-builder.js — generates the Sitecore Item Import CSV.
 *
 * Depends on: SCHEMA from src/schema/index.js
 * Exposes:    CsvBuilder.generate(eventData) → string (CSV text)
 *             CsvBuilder.stats(csvString, eventData) → { items, sections, columns, lines }
 */

import { SCHEMA } from '../schema/index.js'

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

      EventStartDate: ev.eventTimeAndDate?.startDate,
      EventStartTime: ev.eventTimeAndDate?.startTime,
      EventEndDate:   ev.eventTimeAndDate?.endDate,
      EventEndTime:   ev.eventTimeAndDate?.endTime,
      EventTimeZone:  ev.eventTimeAndDate?.timeZone,

      DisplayWeekday:                     ev.eventTimeAndDate?.displayWeekday,
      DisplayEventTimeZone:               ev.eventTimeAndDate?.displayEventTimeZone,
      DisplayGenericTimeZoneAbbreviation: ev.eventTimeAndDate?.displayGenericTimeZoneAbbreviation,
      DisplayEventDuration:               ev.eventTimeAndDate?.displayEventDuration,

      EventLocation:  ev.eventLocation?.location,
      DirectionLink:  ev.eventLocation?.directionLink,

      RegistrationBehavior:     ev.eventRegistration?.registrationBehavior,
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
