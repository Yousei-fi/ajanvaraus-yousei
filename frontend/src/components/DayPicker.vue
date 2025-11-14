<script setup lang="ts">
const model = defineModel<string>({ required: true });
</script>

<template>
  <label>
    Päivä
    <input type="date" v-model="model" />
  </label>
</template>
