import { z } from "zod";

export const createBookingSchema = z
  .object({
    listingId: z.string().min(1),
    userId: z.string().min(1),
    checkIn: z.string().datetime().or(z.string().date()),
    checkOut: z.string().datetime().or(z.string().date()),
    guests: z.number().int().min(1).default(1),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "checkOut doit être après checkIn",
    path: ["checkOut"],
  });

export const availabilityQuerySchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
});

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().min(1),
  provider: z.enum(["STRIPE", "ORANGE_MONEY", "WAVE", "FREE_MONEY"]),
  phoneNumber: z.string().optional(),
});
