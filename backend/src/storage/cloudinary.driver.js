// Placeholder para integración futura con Cloudinary (u otro proveedor pago).
// No implementado en esta etapa: requiere CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en .env.

export const cloudinaryStorageDriver = {
  async saveFile() {
    throw new Error(
      "El driver de almacenamiento 'cloudinary' todavía no está implementado. Usá STORAGE_DRIVER=local."
    );
  },
};
