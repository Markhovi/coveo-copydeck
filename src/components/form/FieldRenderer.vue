<template>
  <div v-if="isVisible" class="field" :id="`field-${fieldKey}`">
    <label v-if="field.type !== 'toggle'">
      {{ field.label }}
      <span v-if="field.required" class="req">requis</span>
      <span v-if="field.charHint || field.hint" class="char-hint">
        {{ field.charHint || field.hint }}
      </span>
    </label>

    <!-- text / url -->
    <template v-if="field.type === 'text' || field.type === 'url'">
      <input
        :type="field.type === 'url' ? 'url' : 'text'"
        :name="fieldKey"
        :placeholder="field.placeholder || ''"
        :required="field.required || false"
        :maxlength="field.maxLength || undefined"
        :value="modelValue"
        :class="{ error: hasError }"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <div v-if="field.maxLength" class="char-counter">
        <span class="count" :class="{ over: (modelValue || '').length > field.maxLength }">
          {{ (modelValue || '').length }}
        </span>/{{ field.maxLength }}
      </div>
    </template>

    <!-- textarea -->
    <template v-else-if="field.type === 'textarea'">
      <textarea
        :name="fieldKey"
        :rows="field.rows || 3"
        :maxlength="field.maxLength || undefined"
        :required="field.required || false"
        :class="{ error: hasError }"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
      ></textarea>
      <div v-if="field.maxLength" class="char-counter">
        <span class="count" :class="{ over: (modelValue || '').length > field.maxLength }">
          {{ (modelValue || '').length }}
        </span>/{{ field.maxLength }}
      </div>
    </template>

    <!-- select -->
    <template v-else-if="field.type === 'select'">
      <select
        :name="fieldKey"
        :value="modelValue"
        @change="emit('update:modelValue', $event.target.value)"
      >
        <option
          v-for="opt in field.options"
          :key="opt.value"
          :value="opt.value"
        >{{ opt.label }}</option>
      </select>
    </template>

    <!-- radio -->
    <template v-else-if="field.type === 'radio'">
      <div class="radio-group">
        <label
          v-for="opt in field.options"
          :key="opt.value"
          class="radio-opt"
        >
          <input
            type="radio"
            :name="fieldKey"
            :value="opt.value"
            :checked="modelValue === opt.value"
            @change="emit('update:modelValue', opt.value)"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </template>

    <!-- toggle -->
    <template v-else-if="field.type === 'toggle'">
      <label class="toggle-field">
        <span class="toggle-label">{{ field.label }}</span>
        <input
          type="checkbox"
          :name="fieldKey"
          role="switch"
          :checked="modelValue"
          @change="emit('update:modelValue', $event.target.checked)"
        />
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>
    </template>

    <!-- date -->
    <template v-else-if="field.type === 'date'">
      <input
        type="date"
        :name="fieldKey"
        :class="{ error: hasError }"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </template>

    <!-- time -->
    <template v-else-if="field.type === 'time'">
      <input
        type="time"
        :name="fieldKey"
        :class="{ error: hasError }"
        :value="modelValue"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  fieldKey:   { type: String, required: true },
  field:      { type: Object, required: true },
  modelValue: { default: '' },
  hasError:   { type: Boolean, default: false },
  // For showWhen: pass all form values so we can evaluate visibility
  allValues:  { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const isVisible = computed(() => {
  if (!props.field.showWhen) return true
  const { field: watchKey, value: showValue } = props.field.showWhen
  return props.allValues[watchKey] === showValue
})
</script>
