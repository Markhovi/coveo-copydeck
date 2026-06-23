<template>
  <header class="topbar">
    <TopBar />
  </header>

  <main>
    <Transition :name="transitionName" mode="out-in">
      <StepZero v-if="store.currentStep === 0"  key="step0" />
      <StepOne  v-else-if="store.currentStep === 1" key="step1" />
      <StepTwo  v-else-if="store.currentStep === 2" key="step2" />
      <StepThree v-else-if="store.currentStep === 3" key="step3" />
    </Transition>
  </main>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useEventStore } from './stores/event.js'
import TopBar from './components/layout/TopBar.vue'
import StepZero from './components/steps/StepZero.vue'
import StepOne from './components/steps/StepOne.vue'
import StepTwo from './components/steps/StepTwo.vue'
import StepThree from './components/steps/StepThree.vue'

const store = useEventStore()

const transitionName = computed(() =>
  store.currentStep >= store.prevStep ? 'slide-forward' : 'slide-back'
)

watch(() => store.theme, (t) => {
  document.body.className = t === 'forest' ? 'theme-forest' : ''
}, { immediate: true })
</script>

<style>
.slide-forward-enter-active,
.slide-back-enter-active {
  transition: opacity 0.36s ease, transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-forward-leave-active,
.slide-back-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-forward-enter-from { opacity: 0; transform: translateX(32px); }
.slide-forward-leave-to   { opacity: 0; transform: translateX(-28px); }
.slide-back-enter-from    { opacity: 0; transform: translateX(-32px); }
.slide-back-leave-to      { opacity: 0; transform: translateX(28px); }
</style>
