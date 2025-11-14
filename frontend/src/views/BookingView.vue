<script setup lang="ts">
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "@fullcalendar/core/index.css";
import "@fullcalendar/daygrid/index.css";
import "@fullcalendar/timegrid/index.css";
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
  <div class="container" style="max-width: 960px; margin: 2rem auto; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.09);">
    <h1 style="margin-top: 0">Ajanvaraus</h1>
    <p>Valitse kalenterista vapaa tunti (ma–pe, klo 08–16) ja täytä tietosi.</p>
    <div ref="calendarEl"></div>

    <dialog v-if="modalOpen" open style="min-width: 320px">
      <h3 style="margin-top: 0">Varaa aika</h3>
      <p v-if="pickedISO">Ajankohta: {{ new Date(pickedISO).toLocaleString("fi-FI") }}</p>
      <form @submit.prevent="submitBooking" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <label>
          Nimi
          <input v-model="form.name" required />
        </label>
        <label>
          Sähköposti
          <input v-model="form.email" type="email" required />
        </label>
        <label>
          Puhelin (valinnainen)
          <input v-model="form.phone" />
        </label>
        <label>
          Lisätiedot
          <textarea v-model="form.notes" rows="3"></textarea>
        </label>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button type="button" style="background: #94a3b8;" @click="modalOpen = false">Peru</button>
          <button type="submit">Vahvista varaus</button>
        </div>
      </form>
    </dialog>
  </div>
</template>
