<template>
  <section class="step step2-fullbleed active">
    <!-- Compact action bar -->
    <div class="preview-bar">
      <div class="preview-bar-left">
        <GoogleDocBar :driveUrl="store.driveUrl || 'https://docs.google.com/document/d/DOCUMENT_ID/edit'" :syncStatus="store.syncStatus" />
      </div>
      <div class="preview-bar-actions">
        <button class="btn-secondary btn-sm" @click="store.goStep(1)">← Modifier</button>
        <a
          class="btn-secondary btn-sm preview-open-btn"
          :href="store.driveUrl || 'https://docs.google.com/document/d/DOCUMENT_ID/edit'"
          target="_blank"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Ouvrir dans Docs
        </a>
        <button class="btn-primary btn-sm" @click="store.goStep(3)">Générer le CSV →</button>
      </div>
    </div>

    <!-- Event page preview -->
    <div class="ep-shell" id="eventPreview">
      <EventPreview v-if="store.eventData" :eventData="store.eventData" />
    </div>
  </section>
</template>

<script setup>
import { useEventStore } from '../../stores/event.js'
import GoogleDocBar from '../ui/GoogleDocBar.vue'
import EventPreview from '../ui/EventPreview.vue'

const store = useEventStore()
</script>
