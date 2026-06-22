/**
 * builders/docx-builder.js — pure-JS ZIP/DOCX generator, zero dependencies.
 *
 * Depends on: SCHEMA from src/schema/index.js
 * Exposes:    DocxBuilder.generate(eventData) → Uint8Array (ZIP bytes)
 */

import { SCHEMA } from '../schema/index.js'

/* ── ZIP utilities ───────────────────────────────────────────────── */

function crc32(bytes) {
  const t = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  let crc = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) crc = t[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function u16(n) { return [n & 0xFF, (n >> 8) & 0xFF] }
function u32(n) { return [n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF] }

const enc = new TextEncoder()
const toBytes = str => enc.encode(str)

function buildZip(files) {
  const parts = [], dirs = []
  let offset = 0

  for (const [name, content] of files) {
    const nb = toBytes(name)
    const cb = typeof content === 'string' ? toBytes(content) : content
    const crc = crc32(cb)

    const lh = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ...u32(crc), ...u32(cb.length), ...u32(cb.length),
      ...u16(nb.length), 0, 0
    ])
    const cd = new Uint8Array([
      0x50, 0x4B, 0x01, 0x02, 20, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ...u32(crc), ...u32(cb.length), ...u32(cb.length),
      ...u16(nb.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(offset)
    ])

    parts.push(lh, nb, cb)
    dirs.push(cd, nb)
    offset += lh.length + nb.length + cb.length
  }

  const dirSize = dirs.reduce((a, b) => a + b.length, 0)
  const eocd = new Uint8Array([
    0x50, 0x4B, 0x05, 0x06, 0, 0, 0, 0,
    ...u16(files.length), ...u16(files.length),
    ...u32(dirSize), ...u32(offset), 0, 0
  ])

  const all = [...parts, ...dirs, eocd]
  const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0))
  let pos = 0
  for (const p of all) { out.set(p, pos); pos += p.length }
  return out
}

/* ── OOXML helpers ───────────────────────────────────────────────── */

function xmlEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function run(text, opts = {}) {
  const rpr = [
    opts.bold   ? '<w:b/>'  : '',
    opts.italic ? '<w:i/>'  : '',
    `<w:sz w:val="${opts.size || 20}"/><w:szCs w:val="${opts.size || 20}"/>`,
    opts.color  ? `<w:color w:val="${opts.color}"/>` : '',
    '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>'
  ].join('')
  return `<w:r><w:rPr>${rpr}</w:rPr><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`
}

function para(content, fill) {
  const ppr = fill
    ? `<w:pPr><w:shd w:val="clear" w:color="auto" w:fill="${fill}"/></w:pPr>`
    : ''
  return `<w:p>${ppr}${content}</w:p>`
}

function cell(content, fill, width) {
  return `<w:tc><w:tcPr>
  <w:tcW w:w="${width}" w:type="dxa"/>
  <w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>
  <w:tcMar>
    <w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/>
    <w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/>
  </w:tcMar>
</w:tcPr>${content}</w:tc>`
}

function tableRow(cells) { return `<w:tr>${cells}</w:tr>` }

function headerRow(label) {
  const c = `<w:tc><w:tcPr>
  <w:gridSpan w:val="2"/>
  <w:tcW w:w="9360" w:type="dxa"/>
  <w:shd w:val="clear" w:color="auto" w:fill="3D3D4E"/>
  <w:tcMar>
    <w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/>
    <w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/>
  </w:tcMar>
</w:tcPr>${para(run(label, { bold: true, color: 'FFFFFF', size: 22 }))}</w:tc>`
  return tableRow(c)
}

function colHeaderRow() {
  const c1 = cell(para(run('Nom du champ (Lisible)', { bold: true, size: 20 })), 'D5E8F0', 3400)
  const c2 = cell(para(run('Valeur (Contenu)',       { bold: true, size: 20 })), 'D5E8F0', 5960)
  return tableRow(c1 + c2)
}

function fieldRow(label, value, docxOptions) {
  const val = String(value == null ? '' : value)

  let labelParas = para(run(label, { bold: true, size: 20, color: '222222' }))
  if (docxOptions) {
    const opts = docxOptions.split('|')
    let optRuns = run('Options : ', { italic: true, size: 17, color: '888888' })
    opts.forEach((o, i) => {
      optRuns += run(o.trim(), { italic: true, bold: true, size: 17, color: '6B46C1' })
      if (i < opts.length - 1)
        optRuns += run(' | ', { italic: true, size: 17, color: 'BBBBBB' })
    })
    labelParas += para(optRuns)
  }

  const c1 = cell(labelParas, 'F5F4FA', 3400)
  const c2 = cell(para(run(val, { size: 20, color: val ? '111111' : 'CCCCCC' })), 'FFFFFF', 5960)
  return tableRow(c1 + c2)
}

/* ── Resolve a field value from the event object ─────────────────── */

function resolveValue(ev, fieldKey) {
  const pathMap = {
    itemName:                           ev.itemName,
    itemPath:                           ev.itemPath,
    metaTitle:                          ev.meta?.metaTitle,
    metaDescription:                    ev.meta?.metaDescription,
    metaImage:                          ev.meta?.metaImage,
    pretitle:                           ev.data?.pretitle,
    title:                              ev.data?.title,
    subtitle:                           ev.data?.subtitle,
    thumbnailImage:                     ev.data?.thumbnailImage,
    heroImage:                          ev.data?.heroImage,
    startDate:                          ev.eventTimeAndDate?.startDate,
    startTime:                          ev.eventTimeAndDate?.startTime,
    endDate:                            ev.eventTimeAndDate?.endDate,
    endTime:                            ev.eventTimeAndDate?.endTime,
    timeZone:                           ev.eventTimeAndDate?.timeZone,
    displayWeekday:                     ev.eventTimeAndDate?.displayWeekday,
    displayEventTimeZone:               ev.eventTimeAndDate?.displayEventTimeZone,
    displayGenericTimeZoneAbbreviation: ev.eventTimeAndDate?.displayGenericTimeZoneAbbreviation,
    displayEventDuration:               ev.eventTimeAndDate?.displayEventDuration,
    location:                           ev.eventLocation?.location,
    directionLink:                      ev.eventLocation?.directionLink,
    registrationBehavior:               ev.eventRegistration?.registrationBehavior,
    externalRegistrationLink:           ev.eventRegistration?.externalRegistrationLink,
    registrationLabel:                  ev.eventRegistration?.registrationLabel,
    overrideFormTitle:                  ev.eventRegistration?.overrideFormTitle,
    eventInProgressMessage:             ev.eventStateMessages?.eventInProgressMessage
  }
  return pathMap[fieldKey] ?? ''
}

/* ── Document XML ────────────────────────────────────────────────── */

function buildDocumentXml(ev) {
  let rows = ''

  // Schema-driven sections
  for (const section of SCHEMA.docxSections) {
    rows += headerRow(section.header)
    rows += colHeaderRow()
    for (const key of section.fieldKeys) {
      const fieldDef = SCHEMA.fields[key]
      if (!fieldDef) continue
      rows += fieldRow(
        fieldDef.docxLabel,
        resolveValue(ev, key),
        fieldDef.docxOptions || null
      )
    }
  }

  // Widgets
  ;(ev.widgets || []).forEach((w, i) => {
    const n = w.contentSectionId || (i + 1)
    rows += headerRow('Widget — Content Section ' + n)
    rows += colHeaderRow()
    rows += fieldRow(`Widget ${n} — Titre de section`,     w.titleSection?.text,               'Left | Right')
    rows += fieldRow(`Widget ${n} — Position du titre`,    w.titleSection?.componentPosition,   'Left | Right')
    rows += fieldRow(`Widget ${n} — Description / Texte`,  w.descriptionSection?.text,          null)
    rows += fieldRow(`Widget ${n} — Position description`, w.descriptionSection?.componentPosition, 'Left | Right')
  })

  const tbl = `<w:tbl>
  <w:tblPr>
    <w:tblW w:w="9360" w:type="dxa"/>
    <w:tblBorders>
      <w:top    w:val="single" w:sz="1" w:color="CCCCCC"/>
      <w:left   w:val="single" w:sz="1" w:color="CCCCCC"/>
      <w:bottom w:val="single" w:sz="1" w:color="CCCCCC"/>
      <w:right  w:val="single" w:sz="1" w:color="CCCCCC"/>
      <w:insideH w:val="single" w:sz="1" w:color="CCCCCC"/>
      <w:insideV w:val="single" w:sz="1" w:color="CCCCCC"/>
    </w:tblBorders>
  </w:tblPr>
  <w:tblGrid>
    <w:gridCol w:w="3400"/>
    <w:gridCol w:w="5960"/>
  </w:tblGrid>
  ${rows}
</w:tbl>`

  const titlePara =
    para(run("Template de Configuration d'Événement", { bold: true, size: 36, color: 'FFFFFF' }), '4A2B8C') +
    para(run('Copy Deck  —  ' + (ev.itemName || ''), { size: 22, color: 'C4B5FD' }), '4A2B8C')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  mc:Ignorable="w14 w15">
  <w:body>
    ${titlePara}
    ${tbl}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/>
    </w:sectPr>
  </w:body>
</w:document>`
}

/* ── Static OOXML boilerplate ────────────────────────────────────── */

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml"  ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>`

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings"
    Target="settings.xml"/>
</Relationships>`

const SETTINGS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
</w:settings>`

/* ── Public API ──────────────────────────────────────────────────── */

export const DocxBuilder = {
  generate(ev) {
    return buildZip([
      ['[Content_Types].xml',          CONTENT_TYPES],
      ['_rels/.rels',                  RELS],
      ['word/_rels/document.xml.rels', DOC_RELS],
      ['word/settings.xml',            SETTINGS],
      ['word/document.xml',            buildDocumentXml(ev)]
    ])
  }
}
