// Futuro: ocultar o eliminar personas de una fotografía y reconstruir el
// fondo con IA. No implementado en esta etapa — ver ProcessingType en
// prisma/schema.prisma (PEOPLE_HIDDEN, PEOPLE_REMOVED_AI_RECONSTRUCTED).

export async function processPhotoPrivacy(_photoId, _processingType) {
  throw new Error("privacyProcessing.service: no implementado todavía");
}
