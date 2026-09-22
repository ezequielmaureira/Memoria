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
      _count: { select: { photos: true } },
    },
  });
  res.json(places);
});
