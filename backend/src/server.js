import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";

import { citiesRouter } from "./routes/cities.routes.js";
import { placesRouter } from "./routes/places.routes.js";
import { placesCreateRouter } from "./routes/places.create.routes.js";
import { photosRouter } from "./routes/photos.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { attachAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(attachAuth);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/cities", citiesRouter);
app.use("/api/places", placesRouter);
app.use("/api/places", placesCreateRouter);
app.use("/api/photos", photosRouter);
app.use("/api/users", usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`MEMORIA backend escuchando en http://localhost:${port}`);
});
