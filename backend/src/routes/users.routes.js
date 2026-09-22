import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req, res) => {
  res.json(req.user);
});

usersRouter.get("/me/contributions", requireAuth, async (req, res) => {
  const [photos, contributions, places, favorites] = await Promise.all([
    prisma.photo.findMany({ where: { uploadedByUserId: req.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.contribution.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } }),
    prisma.place.findMany({
      where: { photos: { some: { uploadedByUserId: req.user.id } } },
      distinct: ["id"],
    }),
    prisma.favorite.findMany({ where: { userId: req.user.id }, include: { place: true } }),
  ]);

  res.json({ photos, contributions, places, favorites });
});
