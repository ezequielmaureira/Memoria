// Abstracción de almacenamiento de imágenes.
//
// En esta etapa solo existe el driver "local" (guarda archivos en
// backend/uploads y sirve /uploads como estático). El driver "cloudinary"
// queda como placeholder para cuando se agregue un proveedor pago.
//
// Todo el resto de la app debe depender únicamente de esta interfaz
// (saveFile) y no del driver concreto.

import { localStorageDriver } from "./local.driver.js";
import { cloudinaryStorageDriver } from "./cloudinary.driver.js";

const drivers = {
  local: localStorageDriver,
  cloudinary: cloudinaryStorageDriver,
};

const driverName = process.env.STORAGE_DRIVER || "local";
const driver = drivers[driverName];

if (!driver) {
  throw new Error(`STORAGE_DRIVER desconocido: "${driverName}"`);
}

// saveFile(file: Express.Multer.File) => Promise<{ url: string }>
export const storage = driver;
