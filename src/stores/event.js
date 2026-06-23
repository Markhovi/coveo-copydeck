import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CsvBuilder } from '../builders/csv-builder.js'

export const useEventStore = defineStore('event', () => {
  const eventData   = ref(null)
  const csvContent  = ref('')
  const currentStep = ref(0)
  const prevStep    = ref(0)
  const driveUrl    = ref('')
  const syncStatus  = ref('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const theme       = ref(localStorage.getItem('copydeck-theme') || 'coveo')
  const prefillData = ref(null)  // pre-populated form values from an imported doc
  const entryMode   = ref(null)  // 'fill' | 'empty' | 'import'

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('copydeck-theme', t)
  }

  function goStep(n) {
    prevStep.value = currentStep.value
    currentStep.value = n
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function submitForm(data) {
    eventData.value  = data
    csvContent.value = CsvBuilder.generate(data)
    goStep(2)
  }

  return {
    eventData,
    csvContent,
    currentStep,
    prevStep,
    driveUrl,
    syncStatus,
    theme,
    prefillData,
    entryMode,
    setTheme,
    goStep,
    submitForm
  }
})
