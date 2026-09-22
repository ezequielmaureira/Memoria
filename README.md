# MEMORIA

**Cada lugar tiene memoria.**

Plataforma colaborativa para recuperar, documentar y explorar la historia visual de
ciudades, pueblos y barrios: fotografías de distintas épocas asociadas a lugares
concretos sobre un mapa interactivo.

Esta es la **Etapa 1 (MVP)**: navegación completa con datos demo, sin reconstrucción
3D ni procesamiento de imágenes con IA (la arquitectura ya está preparada para eso).

## Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router + Leaflet/OpenStreetMap
- **Backend**: Node.js + Express + Prisma ORM + PostgreSQL
- **Autenticación**: Clerk (opcional en desarrollo — la app se explora sin login)
- **Imágenes**: abstracción de almacenamiento propia, con driver local para desarrollo

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior (local o en un contenedor)

## Estructura

```
/backend   API REST (Express + Prisma)
/frontend  Aplicación web (React + Vite)
```

Cada carpeta se instala y ejecuta de forma independiente.

## 1. Configurar PostgreSQL

Creá una base de datos vacía, por ejemplo:

```bash
createdb memoria
```

o con Docker:

```bash
docker run --name memoria-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=memoria -p 5432:5432 -d postgres:16
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editá `backend/.env` y completá `DATABASE_URL` con tus credenciales reales de
PostgreSQL. Las demás variables (Clerk, storage) pueden quedar con sus valores
por defecto para desarrollo.

Ejecutar migraciones y generar el cliente Prisma:

```bash
npx prisma migrate dev --name init
```

Cargar datos demo (ciudad de Campana con lugares y fotos de ejemplo):

```bash
npm run seed
```

Levantar el servidor:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:4000`.

## 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

Con el valor por defecto de `VITE_API_URL`, ya apunta al backend local.

## 4. Recorrido sugerido

1. Abrí `http://localhost:5173`
2. Buscá o entrá a **Campana**
3. Tocá un marcador del mapa → **Plaza Eduardo Costa**
4. Recorré la línea temporal de fotos (1935 → 2026)
5. Entrá a una foto → comentarios / aportes históricos
6. **Aportar foto** (requiere login si Clerk está configurado)

## Variables de entorno

### `backend/.env`

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `PORT` | Puerto del backend (default `4000`) |
| `FRONTEND_URL` | Origen permitido para CORS |
| `CLERK_SECRET_KEY` | Clave secreta de Clerk (dashboard.clerk.com). Vacía = rutas protegidas responden 401 |
| `CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk (no usada por el backend, se deja documentada) |
| `STORAGE_DRIVER` | `local` (default) o `cloudinary` (no implementado aún) |
| `CLOUDINARY_*` | Reservadas para cuando se active el driver de Cloudinary |

### `frontend/.env`

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (default `http://localhost:4000/api`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave pública de Clerk. Vacía = la app funciona solo en modo exploración, sin login |

## Configurar Clerk (opcional para esta etapa)

1. Creá una cuenta/proyecto en https://dashboard.clerk.com
2. Copiá la **Publishable key** a `frontend/.env` → `VITE_CLERK_PUBLISHABLE_KEY`
3. Copiá la **Secret key** a `backend/.env` → `CLERK_SECRET_KEY`
4. Reiniciá ambos servidores

Sin estas claves, toda la navegación y exploración funciona igual; solo quedan
deshabilitadas las acciones que requieren login (aportar foto, comentar, aportar
información).

## Comandos útiles del backend

```bash
npm run prisma:studio    # Explorar la base de datos con una UI
npm run prisma:migrate   # Crear/aplicar migraciones tras cambiar schema.prisma
npm run seed              # Volver a cargar datos demo (usa upsert, es seguro repetir)
```

## Funcionalidades pendientes (fuera de esta etapa)

- Reconstrucción de historias con IA (estructura ya preparada en `backend/src/services/ai`)
- Restauración de fotografías
- Ocultamiento/eliminación de personas por privacidad
- Comparación pasado/presente y reconstrucciones 3D
- Proveedor de almacenamiento en la nube (Cloudinary/S3/Supabase)
- Moderación/administración de contenido (`status: PENDING` existe en el modelo pero no hay panel de revisión)
