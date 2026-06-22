<template>
  <div class="form-card" :id="`card-${section.id}`">
    <div class="card-header">
      <span>
        <span class="card-icon">{{ section.icon }}</span>
        {{ section.label }}
      </span>
    </div>
    <div class="card-body">
      <template v-for="(row, ri) in section.rows" :key="ri">
        <!-- Toggles row -->
        <div v-if="row.cols === 'toggles'" class="toggles-grid">
          <FieldRenderer
            v-for="key in row.fields"
            :key="key"
            :fieldKey="key"
            :field="schema.fields[key]"
            :modelValue="values[key]"
            :allValues="values"
            @update:modelValue="val => emit('update:values', key, val)"
          />
        </div>

        <!-- Grid row -->
        <div
          v-else
          class="field-grid"
          :class="{
            'two-col': row.cols === 2,
            'three-col': row.cols === 3
          }"
        >
          <FieldRenderer
            v-for="key in row.fields"
            :key="key"
            :fieldKey="key"
            :field="schema.fields[key]"
            :modelValue="values[key]"
            :allValues="values"
            :hasError="errors.includes(key)"
            @update:modelValue="val => emit('update:values', key, val)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import FieldRenderer from './FieldRenderer.vue'
import { SCHEMA } from '../../schema/index.js'

defineProps({
  section: { type: Object, required: true },
  values:  { type: Object, default: () => ({}) },
  errors:  { type: Array,  default: () => [] }
})

const emit = defineEmits(['update:values'])
const schema = SCHEMA
</script>
