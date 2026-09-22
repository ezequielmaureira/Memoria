// Permite proponer un lugar nuevo desde el formulario "Aportar foto".
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/errorHandler.js";

export const placesCreateRouter = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createPlaceSchema = z.object({
  cityId: z.string().min(1),
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  category: z.string().optional(),
});

placesCreateRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = createPlaceSchema.parse(req.body);
    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) return next(new ApiError(404, "Ciudad no encontrada"));

    const place = await prisma.place.create({
      data: { ...data, slug: slugify(data.name) },
    });
    res.status(201).json(place);
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new ApiError(400, "Datos inválidos: " + err.errors.map((e) => e.message).join(", ")));
    }
    next(err);
  }
});
