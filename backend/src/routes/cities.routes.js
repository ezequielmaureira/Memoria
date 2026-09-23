import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../middleware/errorHandler.js";

export const citiesRouter = Router();

citiesRouter.get("/", async (_req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { places: true } } },
  });
  res.json(cities);
});

citiesRouter.get("/:slug", async (req, res, next) => {
  const city = await prisma.city.findUnique({
    where: { slug: req.params.slug },
  });
  if (!city) return next(new ApiError(404, "Ciudad no encontrada"));
  res.json(city);
});

citiesRouter.get("/:slug/places", async (req, res, next) => {
  const city = await prisma.city.findUnique({
    where: { slug: req.params.slug },
  });
  if (!city) return next(new ApiError(404, "Ciudad no encontrada"));

  const places = await prisma.place.findMany({
    where: { cityId: city.id },
    orderBy: { name: "asc" },
    include: {
      photos: {
        where: { status: "PUBLISHED" },
        orderBy: { yearFrom: "asc" },
        take: 1,
      },
    },
  });

  // Cantidad de fotos publicadas y período cubierto (primer y último año)
  // por lugar, para las cards del mapa y el listado.
  const stats = await prisma.photo.groupBy({
    by: ["placeId"],
    where: { status: "PUBLISHED", placeId: { in: places.map((p) => p.id) } },
    _count: { _all: true },
    _min: { yearFrom: true },
    _max: { yearFrom: true },
  });
  const statsByPlace = new Map(stats.map((s) => [s.placeId, s]));

  res.json(
    places.map((place) => {
      const s = statsByPlace.get(place.id);
      return {
        ...place,
        photoCount: s?._count._all ?? 0,
        yearMin: s?._min.yearFrom ?? null,
        yearMax: s?._max.yearFrom ?? null,
      };
    })
  );
});
