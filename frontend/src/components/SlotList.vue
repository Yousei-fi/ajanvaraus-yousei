<script setup lang="ts">
const props = defineProps<{ slots: string[] }>();
const emit = defineEmits<{ (e: "pick", iso: string): void }>();
</script>

<template>
  <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem;">
    <li v-for="slot in props.slots" :key="slot">
      <button style="width: 100%;" @click="emit('pick', slot)">
        {{ new Date(slot).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }) }}
      </button>
    </li>
  </ul>
</template>
