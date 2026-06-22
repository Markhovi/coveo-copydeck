<template>
  <div class="form-card" id="card-widgets">
    <div class="card-header">
      <span><span class="card-icon">🧩</span> Widgets — Content Sections</span>
      <button type="button" class="btn-add-widget" @click="addWidget">+ Ajouter une section</button>
    </div>
    <div class="card-body" id="widgets-body">
      <WidgetBlock
        v-for="(widget, i) in widgets"
        :key="widget._id"
        :index="i"
        :data="widget"
        @remove="removeWidget(i)"
        @update="updateWidget(i, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import WidgetBlock from './WidgetBlock.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

let _idCounter = 0
function makeWidget() {
  return {
    _id: ++_idCounter,
    contentSectionId: _idCounter,
    titleSection: { text: '', componentPosition: 'Left' },
    descriptionSection: { text: '', componentPosition: 'Right' }
  }
}

// Initialize with 2 default widgets
const widgets = ref([makeWidget(), makeWidget()])

// Re-number contentSectionId after mutations
function renumber() {
  widgets.value.forEach((w, i) => { w.contentSectionId = i + 1 })
  emit('update:modelValue', widgets.value)
}

function addWidget() {
  widgets.value.push(makeWidget())
  renumber()
}

function removeWidget(i) {
  widgets.value.splice(i, 1)
  renumber()
}

function updateWidget(i, data) {
  widgets.value[i] = data
  emit('update:modelValue', widgets.value)
}

// Emit initial value
emit('update:modelValue', widgets.value)
</script>
