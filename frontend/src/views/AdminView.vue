<script setup lang="ts">
import { DateTime } from "luxon";
import { ref } from "vue";
import { getBookings, postBlock } from "../api";

const token = ref("");
const bookings = ref<any[]>([]);

const start = ref(
  DateTime.now()
    .set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
    .toISO()
);
const end = ref(
  DateTime.now()
    .set({ hour: 16, minute: 0, second: 0, millisecond: 0 })
    .toISO()
);
const reason = ref("");

async function load() {
  if (!token.value) return alert("Syötä admin token");
  const { data } = await getBookings(token.value);
  bookings.value = data.bookings;
}

async function block() {
  if (!token.value) return alert("Syötä admin token");
  await postBlock(token.value, {
    startISO: start.value,
    endISO: end.value,
    reason: reason.value || undefined,
  });
  alert("Blokki luotu");
}
</script>

<template>
  <div class="container" style="max-width: 960px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.09);">
    <h1 style="margin-top: 0">Admin</h1>
    <p>
      <label>Admin token <input v-model="token" placeholder="Bearer JWT" /></label>
      <button @click="load">Päivitä varaukset</button>
    </p>

    <h3>Manuaalinen blokki</h3>
    <p>
      <label>Alku <input v-model="start" /></label>
      <label>Loppu <input v-model="end" /></label>
      <label>Syy <input v-model="reason" /></label>
      <button @click="block">Luo blokki</button>
    </p>

    <h3>Varaukset</h3>
    <ul>
      <li v-for="b in bookings" :key="b.id">
        {{ new Date(b.date).toLocaleString("fi-FI") }} — {{ b.name }} ({{ b.email }}) —
        <a v-if="b.meetLink" :href="b.meetLink" target="_blank">Meet</a>
      </li>
    </ul>
  </div>
</template>
