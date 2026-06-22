<template>
  <section class="step active">
    <div class="page-header">
      <h1>Export CSV Sitecore</h1>
      <img
        class="brush-accent brush-one-img"
        src="/assets/brush-one-red.svg"
        alt=""
        aria-hidden="true"
      />
      <p>Le CSV est prêt à être importé dans Sitecore Item Import.</p>
    </div>

    <div class="csv-summary" v-if="stats">
      <div class="csv-stat">
        <div class="stat-val">{{ stats.items }}</div>
        <div class="stat-lbl">Items Sitecore</div>
      </div>
      <div class="csv-stat">
        <div class="stat-val">{{ stats.sections }}</div>
        <div class="stat-lbl">Content Sections</div>
      </div>
      <div class="csv-stat">
        <div class="stat-val">{{ stats.columns }}</div>
        <div class="stat-lbl">Colonnes CSV</div>
      </div>
      <div class="csv-stat">
        <div class="stat-val">{{ stats.lines }}</div>
        <div class="stat-lbl">Lignes totales</div>
      </div>
    </div>

    <div class="csv-preview-wrap">
      <div class="csv-toolbar">
        <span class="csv-label">Aperçu CSV</span>
        <button class="btn-copy" :class="{ copied: copied }" @click="copyCSV">
          {{ copied ? '✓ Copié' : 'Copier' }}
        </button>
      </div>
      <pre class="csv-preview" v-html="highlightedCsv"></pre>
    </div>

    <div class="step3-actions">
      <button class="btn-secondary" @click="store.goStep(1)">← Recommencer</button>
      <button class="btn-primary btn-lg" @click="downloadCSV">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Télécharger le CSV
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEventStore } from '../../stores/event.js'
import { CsvBuilder } from '../../builders/csv-builder.js'

const store = useEventStore()
const copied = ref(false)

const stats = computed(() => {
  if (!store.csvContent || !store.eventData) return null
  return CsvBuilder.stats(store.csvContent, store.eventData)
})

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const highlightedCsv = computed(() => {
  if (!store.csvContent) return ''
  const [header, ...rest] = store.csvContent.split('\n')
  return `<span style="color:#4A2B8C;font-weight:600;">${escHtml(header)}</span>\n` +
    rest.map(l => escHtml(l)).join('\n')
})

function saveAs(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

function downloadCSV() {
  if (!store.csvContent) return
  const blob = new Blob([store.csvContent], { type: 'text/csv;charset=utf-8;' })
  const slug = (store.eventData?.itemName || 'event').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  saveAs(blob, `sitecore-import-${slug}.csv`)
}

function copyCSV() {
  if (!store.csvContent) return
  navigator.clipboard.writeText(store.csvContent).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>
