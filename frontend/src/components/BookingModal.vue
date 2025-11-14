<script setup lang="ts">
const props = defineProps<{ open: boolean; startISO: string | null }>();
const emit = defineEmits<{ (e: "close"): void; (e: "confirm"): void }>();
</script>

<template>
  <dialog v-if="props.open" open style="min-width: 320px">
    <slot />
    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
      <button type="button" style="background: #94a3b8;" @click="emit('close')">Peru</button>
      <button type="button" @click="emit('confirm')">Vahvista</button>
    </div>
  </dialog>
</template>
