import { useEventStore } from '../stores/event.js'
import { SCHEMA } from '../schema/index.js'

const CLIENT_ID = '574227708196-gis40o1ojrprp7lcj917phbc23doeglg.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file'

let accessToken = null

// ── Auth ───────────────────────────────────────────────────────────────

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) return reject(response.error)
        accessToken = response.access_token
        resolve(accessToken)
      }
    })
    client.requestAccessToken()
  })
}

export function isConnected() {
  return !!accessToken
}

async function apiFetch(url, options = {}) {
  const token = accessToken || await getAccessToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  if (!res.ok) throw new Error(`Google API ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── Drive folder helpers ───────────────────────────────────────────────

async function findOrCreateFolder(name, parentId) {
  const q = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `'${parentId}' in parents`,
    `trashed = false`
  ].join(' and ')
  const search = await apiFetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`
  )
  if (search.files.length > 0) return search.files[0].id
  const folder = await apiFetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] })
  })
  return folder.id
}

async function resolveFolderPath(resourceType, year) {
  const root      = await findOrCreateFolder('Coveo Copydeck', 'root')
  const resources = await findOrCreateFolder('ressources', root)
  const type      = await findOrCreateFolder(resourceType, resources)
  return                  findOrCreateFolder(String(year), type)
}

// ── Section definitions ────────────────────────────────────────────────

const SECTION_COLORS = [
  { bg: '188038', text: 'FFFFFF' }, // green
  { bg: '1558D6', text: 'FFFFFF' }, // blue
  { bg: '7248B9', text: 'FFFFFF' }, // purple
  { bg: '007B83', text: 'FFFFFF' }, // teal
  { bg: 'C25700', text: 'FFFFFF' }, // orange
  { bg: 'A50E0E', text: 'FFFFFF' }, // red
  { bg: '3D5A80', text: 'FFFFFF' }, // navy
]

function getConstraints(field) {
  const parts = []
  if (field.required)   parts.push('Required.')
  if (field.maxLength)  parts.push(`Max ${field.maxLength} characters.`)
  if (field.type === 'richtext') parts.push('Supports bold, italic, lists.')
  if (field.type === 'date')     parts.push('Format: YYYY-MM-DD')
  if (field.type === 'time')     parts.push('Format: HH:MM')
  if (field.type === 'url')      parts.push('Full URL (https://...)')
  if (field.options)   parts.push('Options: ' + field.options.map(o => o.label || o.value).join(' | '))
  if (field.hint && field.hint !== 'Rich text') parts.push(field.hint)
  return parts.join('\n') || '—'
}

// Build { header, rows[] } for each section
// rows: [sitecore_field_name, value, constraints]
function buildSections(eventData) {
  const resolveVal = (ev, key) => {
    const map = {
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
      eventInProgressMessage:             ev.eventStateMessages?.eventInProgressMessage,
    }
    const val = map[key]
    return val == null ? '' : String(val)
  }

  const sections = SCHEMA.docxSections.map(sec => ({
    header: sec.header.toUpperCase(),
    rows: sec.fieldKeys.map(key => {
      const field = SCHEMA.fields[key]
      if (!field) return null
      return [
        field.docxLabel,
        resolveVal(eventData, key),
        getConstraints(field)
      ]
    }).filter(Boolean)
  }))

  // Widget sections
  ;(eventData.widgets || []).forEach((w, i) => {
    const n = w.contentSectionId || (i + 1)
    sections.push({
      header: `CONTENT SECTION ${n}`,
      rows: [
        ['Section Title',       w.titleSection?.text              || '', 'Supports bold, italic, lists. Required.'],
        ['Title Position',      w.titleSection?.componentPosition || '', 'Options: Left | Right'],
        ['Description / Text',  w.descriptionSection?.text        || '', 'Supports bold, italic, lists. Required.'],
        ['Description Position',w.descriptionSection?.componentPosition || '', 'Options: Left | Right'],
      ]
    })
  })

  return sections
}

// ── Docs API helpers ───────────────────────────────────────────────────

async function batchUpdate(docId, requests) {
  return apiFetch(`https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests })
  })
}

function fillTableRequests(table, rows) {
  // rows[0] = col headers, rows[1..] = data rows
  // Each row: [col0, col1, col2]
  const requests = []
  table.tableRows.forEach((row, ri) => {
    const rowData = rows[ri]
    if (!rowData) return
    row.tableCells.forEach((cell, ci) => {
      const text = rowData[ci]
      if (!text) return
      requests.push({
        insertText: { location: { index: cell.content[0].startIndex }, text: String(text) }
      })
    })
  })
  return requests
}

// ── Main document builder ──────────────────────────────────────────────

async function buildDocument(docId, eventData) {
  const sections = buildSections(eventData)
  const COL_HEADER = ['Sitecore Field Name', 'Content Input (Type Inside Here)', 'Rules & Validation Constraints']

  // Phase 1 — insert structure bottom-up (each insert at index 1 prepends to doc)
  const structureRequests = []

  // Build in reverse section order so they end up in correct order after all prepends
  for (let i = sections.length - 1; i >= 0; i--) {
    const sec = sections[i]
    const nRows = 1 + sec.rows.length // col header + data rows
    structureRequests.push(
      { insertTable: { rows: nRows, columns: 3, location: { index: 1 } } },
      { insertText: { text: `●  SECTION ${i + 1}: ${sec.header}\n`, location: { index: 1 } } }
    )
  }

  // Document title + subtitle (prepended last → appear at top)
  structureRequests.push(
    { insertText: {
      text: 'Instructions: Fill in the "Content Input" column only. Do not modify field names or constraints.\n',
      location: { index: 1 }
    }},
    { insertText: {
      text: `Copydeck — ${eventData.itemName || 'Event'}\n`,
      location: { index: 1 }
    }}
  )

  await batchUpdate(docId, structureRequests)

  // Phase 2 — GET doc, find all tables
  const doc    = await apiFetch(`https://docs.googleapis.com/v1/documents/${docId}`)
  const tables = doc.body.content.filter(el => el.table).map(el => el.table)

  if (tables.length !== sections.length) {
    throw new Error(`Expected ${sections.length} tables, found ${tables.length}`)
  }

  // Phase 3 — fill all tables; sort all requests descending to avoid index shifts
  const allFillRequests = []

  tables.forEach((table, i) => {
    const sec  = sections[i]
    const rows = [COL_HEADER, ...sec.rows]
    allFillRequests.push(...fillTableRequests(table, rows))
  })

  allFillRequests.sort((a, b) => b.insertText.location.index - a.insertText.location.index)

  if (allFillRequests.length) await batchUpdate(docId, allFillRequests)

  // Phase 4 — style section header paragraphs
  // Find all section header paragraphs and style them
  const freshDoc = await apiFetch(`https://docs.googleapis.com/v1/documents/${docId}`)
  const styleRequests = []

  let sectionIdx = 0
  for (const el of freshDoc.body.content) {
    if (!el.paragraph) continue
    const text = el.paragraph.elements?.map(e => e.textRun?.content || '').join('') || ''
    if (!text.includes('SECTION') || !text.includes(':')) continue
    const color = SECTION_COLORS[sectionIdx % SECTION_COLORS.length]
    const start = el.startIndex
    const end   = el.endIndex - 1 // exclude trailing \n from style

    styleRequests.push(
      {
        updateParagraphStyle: {
          range: { startIndex: start, endIndex: end },
          paragraphStyle: { namedStyleType: 'HEADING_2', spaceAbove: { magnitude: 16, unit: 'PT' } },
          fields: 'namedStyleType,spaceAbove'
        }
      },
      {
        updateTextStyle: {
          range: { startIndex: start, endIndex: end },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 11, unit: 'PT' },
            foregroundColor: { color: { rgbColor: hexToRgb(color.text) } },
            backgroundColor: { color: { rgbColor: hexToRgb(color.bg) } }
          },
          fields: 'bold,fontSize,foregroundColor,backgroundColor'
        }
      }
    )
    sectionIdx++
  }

  if (styleRequests.length) await batchUpdate(docId, styleRequests)
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return { red: r, green: g, blue: b }
}

// ── Import: read a Google Doc → return prefill data ───────────────────

function getCellText(cell) {
  return (cell?.content || [])
    .flatMap(c => c.paragraph?.elements || [])
    .map(e => e.textRun?.content || '')
    .join('')
    .replace(/\n$/, '')
    .trim()
}

export async function importFromDoc(url) {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/)
  if (!match) throw new Error('URL Google Doc invalide.')
  const docId = match[1]

  if (!accessToken) await getAccessToken()
  const doc = await apiFetch(`https://docs.googleapis.com/v1/documents/${docId}`)

  // Build reverse map: docxLabel → fieldKey
  const labelToKey = {}
  Object.entries(SCHEMA.fields).forEach(([key, field]) => {
    if (field.docxLabel) labelToKey[field.docxLabel] = key
  })

  const formValues = {}
  const widgets    = []

  for (const el of doc.body.content) {
    if (!el.table) continue
    for (const row of el.table.tableRows) {
      if (row.tableCells.length < 2) continue
      const label = getCellText(row.tableCells[0])
      const value = getCellText(row.tableCells[1])
      if (!label || label === 'Sitecore Field Name') continue

      // Main fields
      const key = labelToKey[label]
      if (key) {
        const field = SCHEMA.fields[key]
        if (field?.type === 'toggle') {
          formValues[key] = value === 'true' || value === 'True'
        } else {
          formValues[key] = value
        }
        continue
      }

      // Widget fields — label pattern: "Widget N - ..."
      const wMatch = label.match(/^(?:Content Section|Widget)\s+(\d+)\s+-\s+(.+)$/i)
      if (wMatch) {
        const idx  = parseInt(wMatch[1]) - 1
        const part = wMatch[2].trim()
        if (!widgets[idx]) widgets[idx] = { contentSectionId: idx + 1, titleSection: {}, descriptionSection: {} }
        const w = widgets[idx]
        if (part === 'Section Title')          w.titleSection.text = value
        if (part === 'Title Position')         w.titleSection.componentPosition = value
        if (part === 'Description / Text')     w.descriptionSection.text = value
        if (part === 'Description Position')   w.descriptionSection.componentPosition = value
      }
    }
  }

  return { formValues, widgets: widgets.filter(Boolean) }
}

// ── Public API ─────────────────────────────────────────────────────────

export function useGoogleDrive() {
  const store = useEventStore()

  async function connect() {
    await getAccessToken()
  }

  async function createEmptyDoc(name, resourceType, year) {
    if (!accessToken) await getAccessToken()
    store.syncStatus = 'syncing'
    try {
      const stub = {
        resourceType,
        itemName: name,
        itemPath: `/sitecore/content/Home/Resources/Events/${year}/`,
        eventTimeAndDate: { startDate: `${year}-01-01` },
        widgets: [{ contentSectionId: 1, titleSection: {}, descriptionSection: {} }]
      }
      const folderId = await resolveFolderPath(resourceType, year)
      const file = await apiFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: JSON.stringify({
          name,
          mimeType: 'application/vnd.google-apps.document',
          parents: [folderId]
        })
      })
      await buildDocument(file.id, stub)
      store.driveUrl   = `https://docs.google.com/document/d/${file.id}/edit`
      store.syncStatus = 'synced'
      return store.driveUrl
    } catch (err) {
      console.error('createEmptyDoc failed:', err)
      store.syncStatus = 'error'
      throw err
    }
  }

  async function createDoc(eventData) {
    if (!accessToken) return // not connected — skip silently
    store.syncStatus = 'syncing'
    try {
      const resourceType = eventData.resourceType || 'Events'
      const year = eventData.eventTimeAndDate?.startDate
        ? new Date(eventData.eventTimeAndDate.startDate).getFullYear()
        : new Date().getFullYear()
      const docName = eventData.itemName || 'Copydeck'

      const folderId = await resolveFolderPath(resourceType, year)

      const file = await apiFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: JSON.stringify({
          name: docName,
          mimeType: 'application/vnd.google-apps.document',
          parents: [folderId]
        })
      })

      await buildDocument(file.id, eventData)

      store.driveUrl   = `https://docs.google.com/document/d/${file.id}/edit`
      store.syncStatus = 'synced'
    } catch (err) {
      console.error('createDoc failed:', err)
      store.syncStatus = 'error'
    }
  }

  return { connect, createDoc, createEmptyDoc, isConnected }
}
