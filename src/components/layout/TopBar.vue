<template>
  <div class="topbar-inner">
    <div class="logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#4A2B8C"/>
        <path d="M7 12a5 5 0 0 1 10 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="14" r="2.5" fill="#fff"/>
      </svg>
      <span>Coveo <strong>Event Copydeck</strong></span>
    </div>
    <ThemeToggle />
    <StepPills />
  </div>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
import StepPills from './StepPills.vue'
</script>
