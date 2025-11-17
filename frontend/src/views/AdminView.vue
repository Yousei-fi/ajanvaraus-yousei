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
  <div class="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-6">Admin</h1>
    
    <div class="mb-8 p-4 bg-gray-50 rounded-lg">
      <label class="block mb-2">
        <span class="block text-sm font-medium mb-1">Admin token</span>
        <input v-model="token" placeholder="Bearer JWT" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <button @click="load" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Päivitä varaukset</button>
    </div>

    <div class="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-xl font-semibold mb-4">Manuaalinen blokki</h3>
      <div class="space-y-3">
        <label class="block">
          <span class="block text-sm font-medium mb-1">Alku</span>
          <input v-model="start" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">Loppu</span>
          <input v-model="end" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">Syy</span>
          <input v-model="reason" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <button @click="block" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition">Luo blokki</button>
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-4">Varaukset</h3>
      <ul class="space-y-2">
        <li v-for="b in bookings" :key="b.id" class="p-3 bg-gray-50 rounded-md border border-gray-200">
          <span class="font-medium">{{ new Date(b.date).toLocaleString("fi-FI") }}</span> — 
          <span class="font-medium">{{ b.name }}</span> (<span class="text-gray-600">{{ b.email }}</span>) —
          <a v-if="b.meetLink" :href="b.meetLink" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Meet</a>
        </li>
      </ul>
    </div>
  </div>
</template>
