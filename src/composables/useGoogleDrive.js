import { useEventStore } from '../stores/event.js'

export function useGoogleDrive() {
  const store = useEventStore()

  async function createDoc(eventData) {
    // Stubbed — will be implemented with real Drive API tomorrow
    store.syncStatus = 'syncing'
    // TODO: call Drive API
    store.driveUrl = 'https://docs.google.com/document/d/DOCUMENT_ID/edit'
    store.syncStatus = 'synced'
  }

  async function syncFromDoc() {
    // Stubbed — webhook handler will call this
    store.syncStatus = 'syncing'
    // TODO: re-fetch doc content
    store.syncStatus = 'synced'
  }

  return { createDoc, syncFromDoc }
}
