<template>
  <div class="preview-gdoc-block">
    <svg class="gdoc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#4285F4"/>
      <path d="M8 10h8M8 14h8M8 18h5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M14 2v5h6" fill="#fff" opacity="0.3"/>
    </svg>
    <div class="gdoc-url-wrap">
      <span class="gdoc-label">Google Doc</span>
      <a class="gdoc-url" :href="driveUrl" target="_blank">
        {{ displayUrl }}
      </a>
    </div>
    <span
      class="gdoc-sync-badge"
      :title="syncStatus === 'synced' ? 'Synced with Google Docs' : syncStatus"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
      {{ syncStatus === 'syncing' ? 'Syncing…' : 'Synced' }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  driveUrl:   { type: String, default: 'https://docs.google.com/document/d/DOCUMENT_ID/edit' },
  syncStatus: { type: String, default: 'synced' }
})

const displayUrl = computed(() => {
  try {
    const url = new URL(props.driveUrl)
    return url.hostname + url.pathname
  } catch {
    return props.driveUrl
  }
})
</script>
