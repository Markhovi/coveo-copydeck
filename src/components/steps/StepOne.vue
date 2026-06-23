<template>
  <section class="step active">
    <div class="page-header">
      <h1>Configuration de l'événement</h1>
      <img
        class="brush-accent brush-title-img"
        src="/assets/brush-title-red.svg"
        alt=""
        aria-hidden="true"
      />
      <p>
        Remplissez les champs ci-dessous. Les champs avec
        <span class="req-badge">requis</span> sont obligatoires.
      </p>
    </div>
    <div class="drive-connect-bar">
      <template v-if="!connected">
        <svg width="16" height="16" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.5A9 9 0 000 53h27.5z" fill="#00AC47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.65 10.8z" fill="#EA4335"/><path d="M43.65 25L57.4 1.2A9.16 9.16 0 0054.1 0H33.2a9.16 9.16 0 00-3.3.6z" fill="#00832D"/><path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684FC"/><path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/></svg>
        <span>Connectez Google Drive pour sauvegarder automatiquement le copydeck.</span>
        <button type="button" class="btn-secondary btn-sm" @click="handleConnect">
          {{ connecting ? 'Connexion…' : 'Connecter Google Drive' }}
        </button>
      </template>
      <template v-else>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#188038" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="drive-connected">Google Drive connecté — le copydeck sera sauvegardé automatiquement.</span>
      </template>
    </div>
    <EventForm />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import EventForm from '../form/EventForm.vue'
import { useGoogleDrive, isConnected } from '../../composables/useGoogleDrive.js'

const { connect } = useGoogleDrive()
const connected   = ref(isConnected())
const connecting  = ref(false)

async function handleConnect() {
  connecting.value = true
  try {
    await connect()
    connected.value = true
  } catch (e) {
    console.error(e)
  } finally {
    connecting.value = false
  }
}
</script>

<style scoped>
.drive-connect-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 24px;
  background: var(--surface-2, #f9fafb);
  border: 1px solid var(--input-border, #e5e7eb);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted, #6b7280);
}
.drive-connected { color: #188038; font-weight: 500; }
</style>
