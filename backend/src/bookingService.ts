import { DateTime } from "luxon";
import { calendarClient } from "./google";

export type BookingInput = {
  startISO: string;
  durationMin: number;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
};

export async function createBooking(input: BookingInput) {
  const cal = calendarClient();
  const start = DateTime.fromISO(input.startISO);
  const end = start.plus({ minutes: input.durationMin });

  const requestBase = {
    summary: `Ajanvaraus: ${input.name}`,
    description:
      `Lisätiedot: ${input.notes ?? "-"}\n` +
      `Asiakas: ${input.name}\nSähköposti: ${input.email}\nPuhelin: ${input.phone ?? "-"}`,
    start: { dateTime: start.toISO(), timeZone: "Europe/Helsinki" },
    end: { dateTime: end.toISO(), timeZone: "Europe/Helsinki" },
    attendees: [{ email: input.email }],
    conferenceData: {
      createRequest: {
        requestId: `meet-${start.toMillis()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
    reminders: { useDefault: true },
  } as const;

  const evtA = await cal.events.insert({
    calendarId: process.env.AJANVARAUS_CAL_ID!,
    requestBody: requestBase,
    conferenceDataVersion: 1,
    sendUpdates: "all",
  });

  const evtB = await cal.events.insert({
    calendarId: "primary",
    requestBody: { ...requestBase, summary: `VARATTU: ${input.name}` },
    conferenceDataVersion: 1,
    sendUpdates: "none",
  });

  const meetLink = evtA.data.hangoutLink ?? evtA.data.conferenceData?.entryPoints?.[0]?.uri;

  return { meetLink, eventIdA: evtA.data.id!, eventIdB: evtB.data.id! };
}
