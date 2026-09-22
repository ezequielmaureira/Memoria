import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/errorHandler.js";
import { storage } from "../storage/index.js";

export const photosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

photosRouter.get("/:id", async (req, res, next) => {
  const photo = await prisma.photo.findUnique({
    where: { id: req.params.id },
    include: {
      place: { include: { city: true } },
      uploadedBy: { select: { displayName: true, avatarUrl: true } },
    },
  });
  if (!photo) return next(new ApiError(404, "Foto no encontrada"));
  res.json(photo);
});

const createPhotoSchema = z.object({
  placeId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  exactDate: z.string().optional(),
  dateIsApproximate: z.coerce.boolean().optional().default(true),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  sourceType: z
    .enum([
      "PERSONAL",
      "FAMILY_ARCHIVE",
      "PUBLIC_ARCHIVE",
      "MUSEUM",
      "NEWSPAPER",
      "BOOK",
      "INTERNET",
      "OTHER",
    ])
    .optional()
    .default("OTHER"),
  sourceText: z.string().optional(),
  photographer: z.string().optional(),
});

photosRouter.post("/", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return next(new ApiError(400, "Falta la imagen"));

    const data = createPhotoSchema.parse(req.body);

    const place = await prisma.place.findUnique({ where: { id: data.placeId } });
    if (!place) return next(new ApiError(404, "Lugar no encontrado"));

    const { url } = await storage.saveFile(req.file);

    const photo = await prisma.photo.create({
      data: {
        placeId: data.placeId,
        uploadedByUserId: req.user.id,
        originalImageUrl: url,
        imageUrl: url,
        title: data.title,
        description: data.description,
        yearFrom: data.yearFrom,
        yearTo: data.yearTo,
        exactDate: data.exactDate ? new Date(data.exactDate) : undefined,
        dateIsApproximate: data.dateIsApproximate,
        latitude: data.latitude,
        longitude: data.longitude,
        sourceType: data.sourceType,
        sourceText: data.sourceText,
        photographer: data.photographer,
        status: "PUBLISHED",
      },
    });

    res.status(201).json(photo);
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new ApiError(400, "Datos inválidos: " + err.errors.map((e) => e.message).join(", ")));
    }
    next(err);
  }
});

photosRouter.get("/:id/comments", async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { photoId: req.params.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { displayName: true, avatarUrl: true } } },
  });
  res.json(comments);
});

photosRouter.post("/:id/comments", requireAuth, async (req, res, next) => {
  const content = (req.body?.content || "").trim();
  if (!content) return next(new ApiError(400, "El comentario no puede estar vacío"));

  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (!photo) return next(new ApiError(404, "Foto no encontrada"));

  const comment = await prisma.comment.create({
    data: { photoId: photo.id, userId: req.user.id, content },
    include: { user: { select: { displayName: true, avatarUrl: true } } },
  });
  res.status(201).json(comment);
});

photosRouter.get("/:id/contributions", async (req, res) => {
  const contributions = await prisma.contribution.findMany({
    where: { photoId: req.params.id },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { displayName: true, avatarUrl: true } } },
  });
  res.json(contributions);
});

const contributionSchema = z.object({
  type: z.enum([
    "DATE",
    "LOCATION",
    "IDENTIFICATION",
    "HISTORICAL_FACT",
    "CORRECTION",
    "OTHER",
  ]),
  content: z.string().min(1),
  proposedYearFrom: z.coerce.number().int().optional(),
  proposedYearTo: z.coerce.number().int().optional(),
  proposedLatitude: z.coerce.number().optional(),
  proposedLongitude: z.coerce.number().optional(),
});

photosRouter.post("/:id/contributions", requireAuth, async (req, res, next) => {
  try {
    const data = contributionSchema.parse(req.body);
    const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
    if (!photo) return next(new ApiError(404, "Foto no encontrada"));

    const contribution = await prisma.contribution.create({
      data: { photoId: photo.id, userId: req.user.id, ...data },
      include: { user: { select: { displayName: true, avatarUrl: true } } },
    });
    res.status(201).json(contribution);
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new ApiError(400, "Datos inválidos: " + err.errors.map((e) => e.message).join(", ")));
    }
    next(err);
  }
});
