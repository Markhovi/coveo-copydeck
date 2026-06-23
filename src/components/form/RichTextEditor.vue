<template>
  <div class="rte-wrap" :class="{ error: hasError }">
    <div class="rte-toolbar">
      <button type="button" :class="{ active: editor?.isActive('bold') }"      @click="editor?.chain().focus().toggleBold().run()">      <b>B</b> </button>
      <button type="button" :class="{ active: editor?.isActive('italic') }"    @click="editor?.chain().focus().toggleItalic().run()">    <i>I</i> </button>
      <button type="button" :class="{ active: editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()"> <u>U</u> </button>
      <span class="rte-sep"></span>
      <button type="button" :class="{ active: editor?.isActive('bulletList') }"  @click="editor?.chain().focus().toggleBulletList().run()">  ≡ </button>
      <button type="button" :class="{ active: editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()"> 1. </button>
      <span class="rte-sep"></span>
      <button type="button" @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()"> ✕ </button>
    </div>
    <EditorContent :editor="editor" class="rte-body" />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

const props = defineProps({
  modelValue: { type: String, default: '' },
  hasError:   { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [StarterKit, Underline],
  onUpdate({ editor }) {
    const html = editor.getHTML()
    // Emit empty string instead of bare <p></p>
    emit('update:modelValue', html === '<p></p>' ? '' : html)
  }
})

// Sync external value changes (e.g. form reset or import)
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val || '', false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<style scoped>
.rte-wrap {
  border: 1px solid var(--input-border, #d1d5db);
  border-radius: 6px;
  background: var(--input-bg, #fff);
  transition: border-color .15s;
}
.rte-wrap:focus-within { border-color: var(--accent, #6d28d9); }
.rte-wrap.error        { border-color: #ef4444; }

.rte-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  border-bottom: 1px solid var(--input-border, #e5e7eb);
  background: var(--surface-2, #f9fafb);
  border-radius: 6px 6px 0 0;
}
.rte-toolbar button {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-muted, #6b7280);
  transition: background .1s, color .1s;
}
.rte-toolbar button:hover  { background: var(--surface-3, #e5e7eb); color: var(--text, #111); }
.rte-toolbar button.active { background: var(--accent-soft, #ede9fe); color: var(--accent, #6d28d9); }
.rte-sep { width: 1px; height: 16px; background: var(--input-border, #e5e7eb); margin: 0 2px; }

.rte-body {
  padding: 8px 10px;
  min-height: 60px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text, #111);
  outline: none;
}
.rte-body :deep(.ProseMirror) { outline: none; }
.rte-body :deep(.ProseMirror p)   { margin: 0 0 4px; }
.rte-body :deep(.ProseMirror ul),
.rte-body :deep(.ProseMirror ol)  { margin: 0; padding-left: 20px; }
.rte-body :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--text-muted, #9ca3af);
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
