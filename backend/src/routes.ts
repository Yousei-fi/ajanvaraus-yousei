import { Router } from "express";
import { z } from "zod";
import { getDaySlotsISO } from "./availability";
import { createBooking } from "./bookingService";
import { prisma } from "./prisma";
import { requireAdmin } from "./auth";

export const r = Router();

r.get("/health", (_req, res) => res.json({ ok: true }));

r.get("/availability", async (req, res, next) => {
  try {
    const date = z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(req.query.date);
    const slots = await getDaySlotsISO(`${date}T00:00:00+02:00`);
    res.json({ slots });
  } catch (error) {
    next(error);
  }
});

r.get("/bookings", requireAdmin, async (_req, res) => {
  const list = await prisma.booking.findMany({ orderBy: { date: "asc" } });
  res.json({ bookings: list });
});

r.post("/book", async (req, res, next) => {
  try {
    const body = z
      .object({
        startISO: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const created = await createBooking({
      startISO: body.startISO,
      durationMin: 60,
      name: body.name,
      email: body.email,
      phone: body.phone,
      notes: body.notes,
    });

    await prisma.booking.create({
      data: {
        date: new Date(body.startISO),
        durationMin: 60,
        name: body.name,
        email: body.email,
        phone: body.phone,
        notes: body.notes,
        meetLink: created.meetLink,
        gcalEventId: created.eventIdA,
        gcalEventIdMy: created.eventIdB,
      },
    });

    res.status(201).json({ ok: true, meetLink: created.meetLink });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Booking create error", error);
    }
    res.status(409).json({ ok: false, error: "Slot already taken or create failed" });
    next(error);
  }
});

r.post("/admin/block", requireAdmin, async (req, res, next) => {
  try {
    const body = z
      .object({
        startISO: z.string(),
        endISO: z.string(),
        reason: z.string().optional(),
      })
      .parse(req.body);

    const block = await prisma.block.create({
      data: {
        start: new Date(body.startISO),
        end: new Date(body.endISO),
        reason: body.reason,
      },
    });

    res.json({ ok: true, block });
  } catch (error) {
    next(error);
  }
});
