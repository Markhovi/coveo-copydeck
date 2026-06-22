<template>
  <div class="widget-block" :id="`widget-${index}`">
    <div class="widget-block-header" @click="collapsed = !collapsed">
      <h4>Content Section {{ index + 1 }}</h4>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:12px;color:var(--gray-muted);">{{ collapsed ? '▸' : '▾' }}</span>
        <button
          type="button"
          class="widget-remove"
          @click.stop="emit('remove')"
          title="Supprimer"
        >×</button>
      </div>
    </div>

    <div v-show="!collapsed" class="widget-block-body">
      <div class="field-grid two-col" style="margin-bottom:16px;">
        <div class="field">
          <label>Titre de section <span class="req">requis</span> <span class="char-hint">Rich text</span></label>
          <textarea
            rows="2"
            :value="data.titleSection.text"
            @input="updateField('titleSection', 'text', $event.target.value)"
          ></textarea>
        </div>
        <div class="field">
          <label>Position du titre</label>
          <div class="position-group">
            <label class="position-opt">
              <input
                type="radio"
                :name="`w${index}_titlePos`"
                value="Left"
                :checked="data.titleSection.componentPosition === 'Left'"
                @change="updateField('titleSection', 'componentPosition', 'Left')"
              /> ← Left
            </label>
            <label class="position-opt">
              <input
                type="radio"
                :name="`w${index}_titlePos`"
                value="Right"
                :checked="data.titleSection.componentPosition === 'Right'"
                @change="updateField('titleSection', 'componentPosition', 'Right')"
              /> Right →
            </label>
          </div>
        </div>
      </div>

      <div class="field">
        <label>Description / Texte <span class="req">requis</span> <span class="char-hint">Rich text</span></label>
        <textarea
          rows="3"
          :value="data.descriptionSection.text"
          @input="updateField('descriptionSection', 'text', $event.target.value)"
        ></textarea>
      </div>

      <div class="field" style="margin-top:12px;">
        <label>Position de la description</label>
        <div class="position-group">
          <label class="position-opt">
            <input
              type="radio"
              :name="`w${index}_descPos`"
              value="Left"
              :checked="data.descriptionSection.componentPosition === 'Left'"
              @change="updateField('descriptionSection', 'componentPosition', 'Left')"
            /> ← Left
          </label>
          <label class="position-opt">
            <input
              type="radio"
              :name="`w${index}_descPos`"
              value="Right"
              :checked="data.descriptionSection.componentPosition === 'Right'"
              @change="updateField('descriptionSection', 'componentPosition', 'Right')"
            /> Right →
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  index: { type: Number, required: true },
  data:  { type: Object, required: true }
})

const emit = defineEmits(['remove', 'update'])

const collapsed = ref(false)

function updateField(section, key, value) {
  emit('update', {
    ...props.data,
    [section]: {
      ...props.data[section],
      [key]: value
    }
  })
}
</script>
