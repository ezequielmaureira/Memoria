import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errorHandler.js";

export const placesRouter = Router();

// Nota: los lugares se identifican en las rutas anidadas como
// /ciudad/lugar (slugs), pero acá exponemos también por id para el detalle.
placesRouter.get("/city/:citySlug/place/:placeSlug", async (req, res, next) => {
  const city = await prisma.city.findUnique({
    where: { slug: req.params.citySlug },
  });
  if (!city) return next(new ApiError(404, "Ciudad no encontrada"));

  const place = await prisma.place.findUnique({
    where: { cityId_slug: { cityId: city.id, slug: req.params.placeSlug } },
  });
  if (!place) return next(new ApiError(404, "Lugar no encontrado"));

  // Fuentes disponibles para la sección "Historia de este lugar".
  const [photos, comments, contributions] = await Promise.all([
    prisma.photo.count({ where: { placeId: place.id, status: "PUBLISHED" } }),
    prisma.comment.count({ where: { photo: { placeId: place.id, status: "PUBLISHED" } } }),
    prisma.contribution.count({ where: { photo: { placeId: place.id, status: "PUBLISHED" } } }),
  ]);

  res.json({ ...place, city, stats: { photos, comments, contributions } });
});

placesRouter.get("/:id", async (req, res, next) => {
  const place = await prisma.place.findUnique({
    where: { id: req.params.id },
    include: { city: true },
  });
  if (!place) return next(new ApiError(404, "Lugar no encontrado"));
  res.json(place);
});

placesRouter.get("/:id/photos", async (req, res, next) => {
  const place = await prisma.place.findUnique({ where: { id: req.params.id } });
  if (!place) return next(new ApiError(404, "Lugar no encontrado"));

  const photos = await prisma.photo.findMany({
    where: { placeId: place.id, status: "PUBLISHED" },
    orderBy: [{ yearFrom: "asc" }, { createdAt: "asc" }],
    include: { uploadedBy: { select: { displayName: true, avatarUrl: true } } },
  });
  res.json(photos);
});
