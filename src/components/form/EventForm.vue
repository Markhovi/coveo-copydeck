<template>
  <form id="eventForm" novalidate @submit.prevent="handleSubmit">
    <FormCard
      v-for="section in SCHEMA.sections"
      :key="section.id"
      :section="section"
      :values="formValues"
      :errors="errors"
      @update:values="(key, val) => { formValues[key] = val }"
    />

    <WidgetsCard v-model="widgets" />

    <div class="form-actions">
      <button type="submit" class="btn-primary btn-lg" :disabled="submitting">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        {{ submitting ? 'Chargement…' : 'RÉVISER MAINTENANT' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useEventStore } from '../../stores/event.js'
import { SCHEMA } from '../../schema/index.js'
import FormCard from './FormCard.vue'
import WidgetsCard from './WidgetsCard.vue'

const store = useEventStore()

// ── Build initial form values from schema defaults ─────────────────
const initialValues = {}
Object.entries(SCHEMA.fields).forEach(([key, field]) => {
  if (field.type === 'toggle') {
    initialValues[key] = field.default ?? false
  } else if (field.type === 'radio') {
    initialValues[key] = field.default ?? (field.options?.[0]?.value || '')
  } else if (field.type === 'select') {
    initialValues[key] = field.default ?? (field.options?.[0]?.value || '')
  } else {
    initialValues[key] = field.default ?? ''
  }
})

const formValues = reactive(initialValues)
const widgets    = ref([])
const errors     = ref([])
const submitting = ref(false)

// ── Validation ─────────────────────────────────────────────────────
function validate() {
  const errs = []
  const requiredFields = [
    'itemName', 'metaTitle', 'metaDescription',
    'startDate', 'endDate', 'startTime', 'endTime', 'timeZone'
  ]
  requiredFields.forEach(name => {
    const val = formValues[name]
    if (val === undefined || val === null || String(val).trim() === '') {
      errs.push(name)
    }
  })

  // At least one widget with title+desc
  const hasValidWidget = widgets.value.some(
    w => w.titleSection?.text?.trim() && w.descriptionSection?.text?.trim()
  )
  if (!hasValidWidget) errs.push('widget')

  errors.value = errs
  return errs.length === 0
}

// ── Collect data into event object matching original shape ─────────
function collectData() {
  const v = key => String(formValues[key] ?? '').trim()
  const b = key => Boolean(formValues[key])
  const r = key => formValues[key] || ''

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
      timeZone:    r('timeZone'),
      displayWeekday:                     b('displayWeekday'),
      displayEventTimeZone:               b('displayEventTimeZone'),
      displayGenericTimeZoneAbbreviation: b('displayGenericTimeZoneAbbreviation'),
      displayEventDuration:               b('displayEventDuration')
    },
    eventLocation: {
      location:      v('location'),
      directionLink: v('directionLink')
    },
    eventRegistration: {
      registrationBehavior:     r('registrationBehavior'),
      externalRegistrationLink: v('externalRegistrationLink'),
      registrationLabel:        v('registrationLabel'),
      overrideFormTitle:        v('overrideFormTitle')
    },
    eventStateMessages: {
      eventInProgressMessage: v('eventInProgressMessage')
    },
    widgets: widgets.value.map((w, i) => ({
      contentSectionId: i + 1,
      titleSection: {
        text:              w.titleSection?.text?.trim() || '',
        componentPosition: w.titleSection?.componentPosition || 'Left'
      },
      descriptionSection: {
        text:              w.descriptionSection?.text?.trim() || '',
        componentPosition: w.descriptionSection?.componentPosition || 'Right'
      }
    }))
  }
}

// ── Submit ─────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) {
    // Scroll to first error field
    const firstErrorKey = errors.value[0]
    if (firstErrorKey !== 'widget') {
      const el = document.querySelector(`[name="${firstErrorKey}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }

  submitting.value = true
  try {
    const data = collectData()
    store.submitForm(data)
  } catch (err) {
    console.error(err)
    alert('Erreur : ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>
