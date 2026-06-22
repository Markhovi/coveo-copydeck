<template>
  <Transition name="theme-reveal">
    <div v-if="unlocked" class="theme-toggle">
      <button
        class="theme-opt"
        :class="{ active: store.theme === 'coveo' }"
        @click="store.setTheme('coveo')"
      >Coveo</button>
      <button
        class="theme-opt"
        :class="{ active: store.theme === 'forest' }"
        @click="store.setTheme('forest')"
      >Samurai</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useEventStore } from '../../stores/event.js'

const store = useEventStore()

// ── Easter egg: type "MUGEN" anywhere to reveal the theme switcher ──
const SECRET = 'mugen'
const unlocked = ref(false)
let buffer = ''

function onKeydown(e) {
  if (unlocked.value) return
  // ignore modifier-only / non-character keys
  if (e.key.length !== 1) return
  buffer = (buffer + e.key.toLowerCase()).slice(-SECRET.length)
  if (buffer === SECRET) unlocked.value = true
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.theme-reveal-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.theme-reveal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-4px);
}
</style>
