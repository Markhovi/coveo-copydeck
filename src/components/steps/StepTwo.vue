<template>
  <section class="step step2-fullbleed active">
    <!-- Compact action bar -->
    <div class="preview-bar">
      <div class="preview-bar-left">
        <GoogleDocBar :driveUrl="store.driveUrl || 'https://docs.google.com/document/d/DOCUMENT_ID/edit'" :syncStatus="store.syncStatus" />
      </div>
      <div class="preview-bar-actions">
        <button class="btn-secondary btn-sm" @click="store.goStep(1)">← Modifier</button>
        <span v-if="store.syncStatus === 'syncing'" class="drive-status syncing">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/></svg>
          Sauvegarde Drive…
        </span>
        <a
          v-else-if="store.driveUrl"
          class="btn-secondary btn-sm preview-open-btn"
          :href="store.driveUrl"
          target="_blank"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Voir le copydeck
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
