// Autenticación con Clerk (@clerk/express).
//
// La app debe poder explorarse sin login (rutas GET públicas). Solo las
// rutas que crean contenido (subir foto, comentar, aportar) requieren un
// usuario autenticado.
//
// Si CLERK_SECRET_KEY / CLERK_PUBLISHABLE_KEY todavía no están configuradas
// (ver backend/.env.example) las rutas protegidas responden 401 con un
// mensaje claro en vez de romper el servidor.

import { clerkMiddleware, createClerkClient, getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "./errorHandler.js";

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const isConfigured = Boolean(secretKey && publishableKey);

const clerkClient = isConfigured ? createClerkClient({ secretKey, publishableKey }) : null;

// Valida el token de sesión (header Authorization: Bearer ...) si viene, pero
// no bloquea la request si no lo hay. Solo acepta tokens emitidos para el
// frontend propio (FRONTEND_URL).
export const attachAuth = isConfigured
  ? clerkMiddleware({
      secretKey,
      publishableKey,
      authorizedParties: [process.env.FRONTEND_URL || "http://localhost:5173"],
    })
  : (_req, _res, next) => next();

// Exige un usuario autenticado y adjunta req.user (fila de la tabla users,
// creándola si es la primera vez que este clerkUserId aparece).
export async function requireAuth(req, _res, next) {
  if (!isConfigured) {
    return next(
      new ApiError(
        401,
        "Autenticación no configurada: faltan CLERK_SECRET_KEY / CLERK_PUBLISHABLE_KEY en backend/.env"
      )
    );
  }
  const { userId } = getAuth(req);
  if (!userId) {
    return next(new ApiError(401, "Se requiere iniciar sesión"));
  }

  let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

  if (!user) {
    const clerkUser = await clerkClient.users.getUser(userId);
    user = await prisma.user.create({
      data: {
        clerkUserId: userId,
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
