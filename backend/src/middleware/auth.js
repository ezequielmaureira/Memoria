// Autenticación con Clerk.
//
// La app debe poder explorarse sin login (rutas GET públicas). Solo las
// rutas que crean contenido (subir foto, comentar, aportar) requieren un
// usuario autenticado.
//
// Si CLERK_SECRET_KEY todavía no está configurada (ver backend/.env.example)
// las rutas protegidas responden 401 con un mensaje claro en vez de romper
// el servidor.

import { createClerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "./errorHandler.js";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = clerkSecretKey
  ? createClerkClient({ secretKey: clerkSecretKey })
  : null;

// Adjunta req.auth = { clerkUserId } si hay un token válido, pero no
// bloquea la request si no lo hay.
export async function attachAuth(req, _res, next) {
  req.auth = null;
  try {
    if (!clerkClient) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.slice("Bearer ".length);
    const session = await clerkClient.verifyToken(token);
    if (session?.sub) {
      req.auth = { clerkUserId: session.sub };
    }
  } catch {
    // Token inválido o expirado: se trata como no autenticado.
  }
  next();
}

// Exige un usuario autenticado y adjunta req.user (fila de la tabla users,
// creándola si es la primera vez que este clerkUserId aparece).
export async function requireAuth(req, _res, next) {
  if (!clerkClient) {
    return next(
      new ApiError(
        401,
        "Autenticación no configurada: falta CLERK_SECRET_KEY en backend/.env"
      )
    );
  }
  if (!req.auth?.clerkUserId) {
    return next(new ApiError(401, "Se requiere iniciar sesión"));
  }

  let user = await prisma.user.findUnique({
    where: { clerkUserId: req.auth.clerkUserId },
  });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(req.auth.clerkUserId);
    user = await prisma.user.create({
      data: {
        clerkUserId: req.auth.clerkUserId,
        displayName:
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          clerkUser.username ||
          "Usuario",
        avatarUrl: clerkUser.imageUrl,
      },
    });
  }

  req.user = user;
  next();
}
