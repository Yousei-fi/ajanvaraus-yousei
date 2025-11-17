<script setup lang="ts">
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateTime } from "luxon";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { getAvailability, postBooking } from "../api";

const calendarEl = ref<HTMLDivElement | null>(null);
const pickedISO = ref<string | null>(null);
const modalOpen = ref(false);
const form = ref({ name: "", email: "", phone: "", notes: "" });
let calendar: Calendar | null = null;

async function showDayAvailability(date: Date) {
  const formatted = DateTime.fromJSDate(date).toFormat("yyyy-LL-dd");
  const { data } = await getAvailability(formatted);
  const events = data.slots.map((iso: string) => ({
    start: iso,
    end: DateTime.fromISO(iso).plus({ minutes: 60 }).toISO(),
    display: "background" as const,
    overlap: false,
    color: "#b2fab4",
  }));
  calendar?.removeAllEvents();
  calendar?.addEventSource(events);
}

function initCalendar() {
  if (!calendarEl.value) return;
  calendar = new Calendar(calendarEl.value, {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    initialView: "timeGridWeek",
    firstDay: 1,
    slotMinTime: "08:00:00",
    slotMaxTime: "16:00:00",
    slotDuration: "01:00:00",
    allDaySlot: false,
    selectable: true,
    selectMirror: true,
    weekends: false,
    height: "auto",
    dateClick: (info) => {
      showDayAvailability(info.date);
    },
    select: (info) => {
      const start = DateTime.fromJSDate(info.start, { zone: "Europe/Helsinki" });
      if (start.minute === 0 && start.hour >= 8 && start.hour <= 15) {
        pickedISO.value = start.toISO();
        modalOpen.value = true;
      }
      calendar?.unselect();
    },
  });
  calendar.render();
}

async function submitBooking() {
  if (!pickedISO.value) return;
  try {
    const payload = {
      startISO: pickedISO.value,
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || undefined,
      notes: form.value.notes || undefined,
    };
    const { data } = await postBooking(payload);
    alert(`Varaus onnistui! Meet-linkki: ${data.meetLink ?? "(tulossa emailiin)"}`);
    form.value = { name: "", email: "", phone: "", notes: "" };
    modalOpen.value = false;
  } catch (error) {
    alert("Varaus epäonnistui. Aika on ehkä jo varattu.");
  }
}

onMounted(() => {
  initCalendar();
});

onBeforeUnmount(() => {
  calendar?.destroy();
});
</script>

<template>
  <div class="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-4">Ajanvaraus</h1>
    <p class="text-gray-600 mb-6">Valitse kalenterista vapaa tunti (ma–pe, klo 08–16) ja täytä tietosi.</p>
    <div ref="calendarEl" class="mb-6"></div>

    <dialog v-if="modalOpen" open class="min-w-[320px] rounded-lg p-6 shadow-xl">
      <h3 class="text-xl font-semibold mb-4">Varaa aika</h3>
      <p v-if="pickedISO" class="text-sm text-gray-600 mb-4">Ajankohta: {{ new Date(pickedISO).toLocaleString("fi-FI") }}</p>
      <form @submit.prevent="submitBooking" class="flex flex-col gap-3">
        <label class="block">
          <span class="block text-sm font-medium mb-1">Nimi</span>
          <input v-model="form.name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">Sähköposti</span>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">Puhelin (valinnainen)</span>
          <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label class="block">
          <span class="block text-sm font-medium mb-1">Lisätiedot</span>
          <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </label>
        <div class="flex gap-2 justify-end mt-4">
          <button type="button" class="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition" @click="modalOpen = false">Peru</button>
          <button type="submit" class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition">Vahvista varaus</button>
        </div>
      </form>
    </dialog>
  </div>
</template>
