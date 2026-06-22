import { ref } from 'vue'
import { defineStore } from 'pinia'
import { CsvBuilder } from '../builders/csv-builder.js'

export const useEventStore = defineStore('event', () => {
  const eventData  = ref(null)
  const csvContent = ref('')
  const currentStep = ref(1)
  const prevStep   = ref(1)
  const driveUrl   = ref('')
  const syncStatus = ref('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const theme      = ref(localStorage.getItem('copydeck-theme') || 'coveo')

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
    setTheme,
    goStep,
    submitForm
  }
})
