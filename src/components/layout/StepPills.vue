<template>
  <nav class="steps-nav">
    <button
      class="step-pill"
      :class="{ active: store.currentStep === 1, done: store.currentStep > 1 }"
      @click="store.goStep(1)"
    >
      <span class="pill-num">1</span> Remplir
    </button>
    <span class="step-arrow">→</span>
    <button
      class="step-pill"
      :class="{ active: store.currentStep === 2, done: store.currentStep > 2 }"
      :disabled="!store.eventData"
      @click="store.eventData && store.goStep(2)"
    >
      <span class="pill-num">2</span> Révision
    </button>
    <span class="step-arrow">→</span>
    <button
      class="step-pill"
      :class="{ active: store.currentStep === 3 }"
      :disabled="!store.eventData"
      @click="store.eventData && store.goStep(3)"
    >
      <span class="pill-num">3</span> Export CSV
    </button>
  </nav>
</template>

<script setup>
import { useEventStore } from '../../stores/event.js'
const store = useEventStore()
</script>
