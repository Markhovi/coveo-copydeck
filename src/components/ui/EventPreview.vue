<template>
  <div class="ep-shell">
    <!-- Hero -->
    <div class="ep-hero">
      <div class="ep-hero-content">
        <div v-if="ev.data?.pretitle" class="ep-pretitle">{{ ev.data.pretitle }}</div>
        <h1 class="ep-title" v-html="ev.data?.title || 'Event Title'"></h1>
        <div class="ep-meta-row">
          <div v-if="dateRange" class="ep-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {{ dateRange }}
          </div>
          <div v-if="timeRange" class="ep-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ timeRange }}
          </div>
          <div v-if="ev.eventLocation?.location" class="ep-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ ev.eventLocation.location }}
          </div>
        </div>
        <div class="ep-hero-cta">{{ regLabel }}</div>
      </div>
      <div class="ep-hero-visual">
        <div class="ep-hero-img">
          <img
            v-if="ev.data?.heroImage"
            :src="ev.data.heroImage"
            alt=""
            @error="$event.target.style.display='none'"
          />
          <template v-else>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Hero Image</span>
          </template>
        </div>
      </div>
    </div>

    <!-- Content sections -->
    <div class="ep-sections">
      <template v-if="validWidgets.length">
        <div
          v-for="(w, i) in validWidgets"
          :key="i"
          class="ep-section"
        >
          <div class="ep-section-title" v-html="w.titleSection?.text || ''"></div>
          <div class="ep-section-desc"  v-html="w.descriptionSection?.text || ''"></div>
        </div>
      </template>
      <div v-else class="ep-sections-empty">
        <div class="ep-section-placeholder" style="width:40%"></div>
        <div class="ep-section-placeholder" style="width:70%"></div>
        <div class="ep-section-placeholder" style="width:55%"></div>
        <p style="margin-top:24px;color:#9ca3af;font-size:13px;text-align:center">
          Les sections de contenu (widgets) apparaîtront ici
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const TZ_SHORT = {
  'Eastern Standard Time':          'ET',
  'Central Standard Time':          'CT',
  'Pacific Standard Time':          'PT',
  'GMT Standard Time':              'GMT',
  'Central European Standard Time': 'CET'
}

function fmtDate(iso, showWeekday) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  const opts = { month: 'long', day: 'numeric', year: 'numeric' }
  if (showWeekday) opts.weekday = 'long'
  return d.toLocaleDateString('en-US', opts)
}

function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return m ? `${hr}:${m.toString().padStart(2, '0')} ${ap}` : `${hr}:00 ${ap}`
}

const props = defineProps({
  eventData: { type: Object, required: true }
})

const ev = computed(() => props.eventData)

const dateRange = computed(() => {
  const td = ev.value.eventTimeAndDate || {}
  const dateStr    = fmtDate(td.startDate, td.displayWeekday)
  const endDateStr = fmtDate(td.endDate, false)
  if (!dateStr) return ''
  return (endDateStr && td.endDate !== td.startDate)
    ? `${dateStr} — ${endDateStr}`
    : dateStr
})

const timeRange = computed(() => {
  const td = ev.value.eventTimeAndDate || {}
  const timeStr    = fmtTime(td.startTime)
  const endTimeStr = fmtTime(td.endTime)
  if (!timeStr) return ''
  const tzStr = td.displayEventTimeZone
    ? (td.displayGenericTimeZoneAbbreviation ? TZ_SHORT[td.timeZone] || '' : td.timeZone || '')
    : ''
  const range = endTimeStr ? `${timeStr} – ${endTimeStr}` : timeStr
  return tzStr ? `${range} ${tzStr}` : range
})

const regLabel = computed(() => {
  return ev.value.eventRegistration?.registrationLabel || 'Register Now'
})

const validWidgets = computed(() => {
  return (ev.value.widgets || []).filter(
    w => w.titleSection?.text?.trim() || w.descriptionSection?.text?.trim()
  )
})
</script>
