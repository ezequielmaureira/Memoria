# Servicios de IA (futuro)

Esta carpeta define la interfaz que tendrán los servicios de IA cuando se
incorporen. Por ahora **ningún proveedor está conectado**: cada archivo
exporta una función que lanza "no implementado".

Flujo previsto:

```
FOTOS + COMENTARIOS + CONTRIBUCIONES + FUENTES
                  ↓
                  IA
                  ↓
        HISTORIA DEL LUGAR
```

Reglas:

- La IA nunca reemplaza ni modifica la evidencia original (`originalImageUrl`
  en el modelo `Photo` se conserva siempre).
- Cualquier resultado generado se guarda aparte (`processedImageUrl`,
  `processingType`) y se marca explícitamente como generado por IA.

Archivos:

- `historicalStory.service.js` — generará el bloque "Historia de este lugar"
  a partir de fotos/comentarios/contribuciones de un lugar.
- `photoRestoration.service.js` — restauración de fotos antiguas.
- `privacyProcessing.service.js` — ocultar/eliminar personas y reconstruir
  el fondo.
- `placeRecognition.service.js` — reconocimiento automático de lugares a
  partir de una imagen.
