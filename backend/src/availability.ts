import { DateTime } from "luxon";
import { prisma } from "./prisma";

export async function getDaySlotsISO(dateISO: string) {
  const day = DateTime.fromISO(dateISO, { zone: "Europe/Helsinki" });
  if (!day.isValid || day.weekday > 5) return [];

  const starts: string[] = [];
  for (let hour = 8; hour <= 15; hour++) {
    const slot = day.set({ hour, minute: 0, second: 0, millisecond: 0 });
    starts.push(slot.toISO());
  }

  const dayStartUTC = day.startOf("day").toUTC().toJSDate();
  const dayEndUTC = day.endOf("day").toUTC().toJSDate();

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "CONFIRMED", date: { gte: dayStartUTC, lte: dayEndUTC } },
      select: { date: true },
    }),
    prisma.block.findMany({
      where: {
        start: { lte: dayEndUTC },
        end: { gte: dayStartUTC },
      },
    }),
  ]);

  const bookedSet = new Set(
    bookings.map((b) => DateTime.fromJSDate(b.date).setZone("Europe/Helsinki").toISO())
  );

  return starts
    .filter((iso) => !bookedSet.has(iso))
    .filter((iso) => {
      const startDate = DateTime.fromISO(iso);
      return !blocks.some((b) => {
        const blockStart = DateTime.fromJSDate(b.start).setZone("Europe/Helsinki");
        const blockEnd = DateTime.fromJSDate(b.end).setZone("Europe/Helsinki");
        return startDate >= blockStart && startDate < blockEnd;
      });
    });
}
