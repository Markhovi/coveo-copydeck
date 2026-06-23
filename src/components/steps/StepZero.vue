<template>
  <section class="step-zero">
    <div class="sz-header">
      <h1>Event Copydeck</h1>
      <p>Quel est votre besoin aujourd'hui ?</p>
    </div>

    <div class="sz-cards">

      <!-- A: Fill now -->
      <div class="sz-card" :class="{ active: mode === 'fill' }" @click="mode = 'fill'">
        <div class="sz-card-icon">📝</div>
        <h2>Remplir le copydeck</h2>
        <p>J'ai tout le contenu prêt et je veux générer le copydeck et le CSV.</p>
        <button class="btn-primary" @click.stop="goFill">Commencer →</button>
      </div>

      <!-- B: Empty copydeck -->
      <div class="sz-card" :class="{ active: mode === 'empty' }" @click="mode = 'empty'">
        <div class="sz-card-icon">📄</div>
        <h2>Copydeck vide</h2>
        <p>Je n'ai pas encore tout le contenu. Je veux créer la structure pour que l'équipe la remplisse.</p>

        <div v-if="mode === 'empty'" class="sz-inline-form" @click.stop>
          <div class="sz-field">
            <label>Nom de l'événement <span class="req">requis</span></label>
            <input v-model="emptyName" type="text" placeholder="ex: SAP Sapphire Madrid 2026" @input="updateSlug" />
            <span v-if="emptySlug" class="sz-slug">Slug : {{ emptySlug }}</span>
          </div>
          <div class="sz-field">
            <label>Type de ressource</label>
            <select v-model="emptyType">
              <option value="Events">Events</option>
              <option value="Reports">Reports</option>
              <option value="Ebook">Ebook</option>
              <option value="Product Sheet">Product Sheet</option>
            </select>
          </div>
          <div class="sz-field">
            <label>Année</label>
            <input v-model="emptyYear" type="number" :placeholder="currentYear" min="2020" max="2035" />
          </div>

          <div v-if="!driveConnected" class="sz-drive-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Google Drive requis pour créer le copydeck.
            <button type="button" class="btn-link" @click="handleConnect">Connecter</button>
          </div>

          <div v-if="emptyDocUrl" class="sz-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#188038" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Copydeck créé —
            <a :href="emptyDocUrl" target="_blank">Ouvrir dans Google Docs</a>
          </div>

          <button
            class="btn-primary"
            :disabled="!emptyName.trim() || emptyLoading"
            @click="generateEmpty"
          >
            {{ emptyLoading ? 'Création…' : 'Générer le copydeck vide' }}
          </button>
        </div>

        <button v-else class="btn-secondary" @click.stop="mode = 'empty'">Choisir cette option</button>
      </div>

      <!-- C: Import -->
      <div class="sz-card" :class="{ active: mode === 'import' }" @click="mode = 'import'">
        <div class="sz-card-icon">📥</div>
        <h2>Importer un copydeck</h2>
        <p>J'ai déjà un copydeck Google Docs rempli et je veux générer le CSV.</p>

        <div v-if="mode === 'import'" class="sz-inline-form" @click.stop>
          <div class="sz-field">
            <label>URL du Google Doc</label>
            <input v-model="importUrl" type="url" placeholder="https://docs.google.com/document/d/..." />
          </div>

          <div v-if="importError" class="sz-error">{{ importError }}</div>

          <button
            class="btn-primary"
            :disabled="!importUrl.trim() || importLoading"
            @click="handleImport"
          >
            {{ importLoading ? 'Lecture du doc…' : 'Importer et réviser →' }}
          </button>
        </div>

        <button v-else class="btn-secondary" @click.stop="mode = 'import'">Choisir cette option</button>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEventStore } from '../../stores/event.js'
import { useGoogleDrive, importFromDoc, isConnected } from '../../composables/useGoogleDrive.js'

const store = useEventStore()
const { connect, createEmptyDoc } = useGoogleDrive()

const mode          = ref(null)
const currentYear   = new Date().getFullYear()

// ── Path A ─────────────────────────────────────────────────────────────
function goFill() {
  store.entryMode = 'fill'
  store.goStep(1)
}

// ── Path B — empty copydeck ────────────────────────────────────────────
const emptyName    = ref('')
const emptySlug    = ref('')
const emptyType    = ref('Events')
const emptyYear    = ref(currentYear)
const emptyLoading = ref(false)
const emptyDocUrl  = ref('')
const driveConnected = ref(isConnected())

function toSlug(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function updateSlug() {
  emptySlug.value = emptyName.value.trim() ? toSlug(emptyName.value.trim()) : ''
}

async function handleConnect() {
  await connect()
  driveConnected.value = true
}

async function generateEmpty() {
  if (!emptyName.value.trim()) return
  if (!driveConnected.value) { await handleConnect() }
  emptyLoading.value = true
  try {
    const name = emptySlug.value || emptyName.value.trim()
    emptyDocUrl.value = await createEmptyDoc(name, emptyType.value, emptyYear.value)
  } catch (e) {
    console.error(e)
  } finally {
    emptyLoading.value = false
  }
}

// ── Path C — import ────────────────────────────────────────────────────
const importUrl     = ref('')
const importLoading = ref(false)
const importError   = ref('')

async function handleImport() {
  importError.value   = ''
  importLoading.value = true
  try {
    const result = await importFromDoc(importUrl.value.trim())
    store.prefillData = result
    store.entryMode   = 'import'
    store.goStep(1)
  } catch (e) {
    importError.value = e.message || 'Erreur lors de la lecture du document.'
  } finally {
    importLoading.value = false
  }
}
</script>

<style scoped>
.step-zero {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px;
}

.sz-header {
  text-align: center;
  margin-bottom: 40px;
}
.sz-header h1 { font-size: 2rem; margin: 0 0 8px; }
.sz-header p  { color: var(--text-muted, #6b7280); font-size: 1.05rem; margin: 0; }

.sz-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.sz-card {
  background: var(--surface, #fff);
  border: 2px solid var(--input-border, #e5e7eb);
  border-radius: 12px;
  padding: 28px 24px;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sz-card:hover  { border-color: var(--accent, #6d28d9); }
.sz-card.active { border-color: var(--accent, #6d28d9); box-shadow: 0 0 0 3px var(--accent-soft, #ede9fe); }

.sz-card-icon { font-size: 2rem; line-height: 1; }
.sz-card h2   { font-size: 1.1rem; margin: 0; }
.sz-card p    { color: var(--text-muted, #6b7280); font-size: 0.9rem; margin: 0; flex: 1; }

.sz-inline-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
  border-top: 1px solid var(--input-border, #e5e7eb);
  padding-top: 16px;
}

.sz-field       { display: flex; flex-direction: column; gap: 4px; }
.sz-field label { font-size: 12px; font-weight: 600; color: var(--text-muted, #6b7280); }
.sz-field input,
.sz-field select {
  padding: 7px 10px;
  border: 1px solid var(--input-border, #d1d5db);
  border-radius: 6px;
  font-size: 13px;
  background: var(--input-bg, #fff);
  color: var(--text, #111);
}
.sz-slug {
  font-size: 11px;
  color: var(--text-muted, #9ca3af);
  font-family: monospace;
}

.sz-drive-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  background: var(--surface-2, #f9fafb);
  padding: 8px 10px;
  border-radius: 6px;
}
.btn-link {
  background: none;
  border: none;
  color: var(--accent, #6d28d9);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  text-decoration: underline;
}

.sz-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #188038;
}
.sz-success a { color: #188038; }

.sz-error {
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  padding: 8px 10px;
  border-radius: 6px;
}

@media (max-width: 720px) {
  .sz-cards { grid-template-columns: 1fr; }
}
</style>
