// Seed de desarrollo para MEMORIA.
//
// IMPORTANTE: todos los textos, años, comentarios y aportes de este seed son
// de EJEMPLO, creados para probar la aplicación. No representan hechos
// históricos verificados y se guardan con isDemo = true.
// Las imágenes son ilustraciones SVG generadas acá (placeholders), no
// fotografías reales.
//
// Se puede correr varias veces: actualiza ciudad y lugares, y regenera
// únicamente las fotos demo (con sus comentarios y aportes). Las fotos
// aportadas por usuarios reales no se tocan.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Placeholders
// ---------------------------------------------------------------------------

// Paleta según la época, para que el timeline se vea distinto década a década.
function eraPalette(year) {
  if (year < 1950)
    return { sky: "#e9dcc3", ground: "#b89f7c", ink: "#4a3826", accent: "#8a6a4b", filter: "sepia" };
  if (year < 1975)
    return { sky: "#dcdcd8", ground: "#9a9a94", ink: "#2e2e2b", accent: "#5f5f5a", filter: "bw" };
  if (year < 2000)
    return { sky: "#e6d2b8", ground: "#a7a07a", ink: "#4b4034", accent: "#b0714a", filter: "faded" };
  return { sky: "#cfe0ea", ground: "#8fae7c", ink: "#2f3a40", accent: "#c0643a", filter: "color" };
}

// Escena simple según la categoría del lugar. `y` agrega detalles que
// cambian con los años (más edificios, árboles más grandes, etc.).
function scene(kind, year, c) {
  const later = year >= 1975;
  const modern = year >= 2000;
  switch (kind) {
    case "plaza":
      return `
        <rect x="0" y="380" width="800" height="220" fill="${c.ground}"/>
        <path d="M400 380 L300 600 L500 600 Z" fill="${c.sky}" opacity="0.6"/>
        ${[120, 240, 560, 680]
          .map(
            (x) => `<rect x="${x - 6}" y="${modern ? 250 : 300}" width="12" height="${modern ? 130 : 80}" fill="${c.ink}"/>
            <circle cx="${x}" cy="${modern ? 240 : 290}" r="${modern ? 70 : year < 1950 ? 30 : 48}" fill="${c.accent}" opacity="0.75"/>`
          )
          .join("")}
        <rect x="385" y="250" width="30" height="130" fill="${c.ink}"/>
        <rect x="370" y="240" width="60" height="16" fill="${c.ink}"/>
        ${later ? `<rect x="0" y="330" width="800" height="50" fill="${c.ink}" opacity="0.25"/>` : ""}`;
    case "templo":
      return `
        <rect x="0" y="430" width="800" height="170" fill="${c.ground}"/>
        <rect x="270" y="230" width="260" height="200" fill="${c.accent}"/>
        <rect x="370" y="110" width="60" height="120" fill="${c.accent}"/>
        <path d="M360 110 L400 50 L440 110 Z" fill="${c.ink}"/>
        <rect x="396" y="30" width="8" height="30" fill="${c.ink}"/>
        <path d="M370 430 L370 350 Q400 310 430 350 L430 430 Z" fill="${c.ink}"/>
        <circle cx="400" cy="270" r="22" fill="${c.sky}"/>
        ${later ? `<rect x="80" y="330" width="150" height="100" fill="${c.ink}" opacity="0.35"/><rect x="570" y="310" width="160" height="120" fill="${c.ink}" opacity="0.35"/>` : ""}`;
    case "estacion":
      return `
        <rect x="0" y="420" width="800" height="180" fill="${c.ground}"/>
        <rect x="120" y="260" width="420" height="160" fill="${c.accent}"/>
        <path d="M100 260 L330 190 L560 260 Z" fill="${c.ink}"/>
        ${[160, 240, 320, 400, 480].map((x) => `<rect x="${x}" y="310" width="40" height="70" fill="${c.sky}"/>`).join("")}
        <line x1="0" y1="500" x2="800" y2="500" stroke="${c.ink}" stroke-width="6"/>
        <line x1="0" y1="540" x2="800" y2="540" stroke="${c.ink}" stroke-width="6"/>
        ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 42}" y="495" width="8" height="52" fill="${c.ink}" opacity="0.6"/>`).join("")}
        ${year < 1970 ? `<rect x="590" y="360" width="160" height="80" fill="${c.ink}"/><circle cx="620" cy="450" r="16" fill="${c.ink}"/><circle cx="720" cy="450" r="16" fill="${c.ink}"/><circle cx="640" cy="330" r="22" fill="${c.sky}" opacity="0.8"/>` : ""}`;
    case "municipal":
      return `
        <rect x="0" y="440" width="800" height="160" fill="${c.ground}"/>
        <rect x="160" y="200" width="480" height="240" fill="${c.accent}"/>
        <path d="M140 200 L400 120 L660 200 Z" fill="${c.ink}"/>
        ${[200, 270, 340, 430, 500, 570].map((x) => `<rect x="${x}" y="230" width="22" height="210" fill="${c.sky}" opacity="0.85"/>`).join("")}
        <rect x="370" y="330" width="60" height="110" fill="${c.ink}"/>
        <rect x="396" y="60" width="8" height="70" fill="${c.ink}"/>
        <rect x="404" y="62" width="40" height="24" fill="${c.accent}"/>`;
    case "avenida":
      return `
        <rect x="0" y="360" width="800" height="240" fill="${c.ground}"/>
        <path d="M360 360 L440 360 L760 600 L40 600 Z" fill="${c.ink}" opacity="0.8"/>
        ${[0, 1, 2, 3, 4].map((i) => `<rect x="${396 - i * 2}" y="${380 + i * 45}" width="${8 + i * 4}" height="${18 + i * 6}" fill="${c.sky}"/>`).join("")}
        ${[40, 150, 600, 700]
          .map((x, i) => `<rect x="${x}" y="${modern ? 150 + i * 10 : 260}" width="${modern ? 90 : 70}" height="${modern ? 210 - i * 10 : 100}" fill="${c.accent}" opacity="0.8"/>`)
          .join("")}
        ${later ? `<rect x="330" y="470" width="70" height="36" rx="8" fill="${c.accent}"/><rect x="460" y="420" width="46" height="24" rx="6" fill="${c.sky}"/>` : ""}`;
    case "puerto":
      return `
        <rect x="0" y="380" width="800" height="220" fill="${c.accent}" opacity="0.55"/>
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 110} ${440 + (i % 3) * 30} q25 -10 50 0 t50 0" stroke="${c.sky}" stroke-width="3" fill="none"/>`).join("")}
        <rect x="0" y="340" width="800" height="40" fill="${c.ink}"/>
        <path d="M180 420 L520 420 L480 470 L220 470 Z" fill="${c.ink}"/>
        <rect x="260" y="370" width="120" height="50" fill="${c.ink}" opacity="0.85"/>
        ${year < 1960 ? `<rect x="300" y="300" width="18" height="70" fill="${c.ink}"/>` : ""}
        <line x1="620" y1="340" x2="620" y2="${later ? 110 : 190}" stroke="${c.ink}" stroke-width="10"/>
        <line x1="620" y1="${later ? 120 : 200}" x2="${later ? 470 : 530}" y2="${later ? 120 : 200}" stroke="${c.ink}" stroke-width="8"/>
        ${modern ? `<rect x="680" y="280" width="100" height="60" fill="${c.accent}"/><rect x="690" y="230" width="80" height="50" fill="${c.sky}" stroke="${c.ink}" stroke-width="3"/>` : ""}`;
    default:
      return `<rect x="0" y="400" width="800" height="200" fill="${c.ground}"/>`;
  }
}

function placeholderImage(kind, placeName, year) {
  const c = eraPalette(year);
  const grain =
    c.filter === "color"
      ? ""
      : `<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.35 0"/></filter>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    ${grain}
    <radialGradient id="v" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="${c.filter === "color" ? 0.15 : 0.45}"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="${c.sky}"/>
  ${scene(kind, year, c)}
  ${grain ? `<rect width="800" height="600" filter="url(#g)"/>` : ""}
  <rect width="800" height="600" fill="url(#v)"/>
  <rect x="24" y="24" width="210" height="34" rx="17" fill="#1c1a17" opacity="0.72"/>
  <text x="129" y="46" font-family="sans-serif" font-size="14" letter-spacing="2" fill="#f5f0e6" text-anchor="middle">CONTENIDO DEMO</text>
  <text x="776" y="572" font-family="Georgia, serif" font-size="44" fill="#f5f0e6" opacity="0.9" text-anchor="end">${year}</text>
  <text x="24" y="572" font-family="sans-serif" font-size="16" fill="#f5f0e6" opacity="0.85">${placeName} · ilustración</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Datos demo
// ---------------------------------------------------------------------------

const DEMO_USERS = [
  { clerkUserId: "demo_seed_user", displayName: "Vecino de Campana (demo)" },
  { clerkUserId: "demo_maria", displayName: "María (demo)" },
  { clerkUserId: "demo_carlos", displayName: "Carlos (demo)" },
  { clerkUserId: "demo_ana", displayName: "Ana (demo)" },
  { clerkUserId: "demo_jorge", displayName: "Jorge (demo)" },
];

const SOURCES = [
  { sourceType: "FAMILY_ARCHIVE", sourceText: "Archivo familiar (demo)" },
  { sourceType: "NEWSPAPER", sourceText: "Recorte de diario local (demo)" },
  { sourceType: "PERSONAL", sourceText: "Colección personal (demo)" },
  { sourceType: "PUBLIC_ARCHIVE", sourceText: "Archivo público (demo)" },
];

// Comentarios genéricos: recuerdos y opiniones, nunca afirmaciones
// históricas presentadas como hechos.
const COMMENTS = [
  ["demo_maria", "Mi abuelo decía que este sector era muy distinto antes."],
  ["demo_carlos", "Creo que esta fotografía podría ser de finales de los años 40."],
  ["demo_ana", "Qué lindo ver cómo cambió. Pasé muchas tardes por acá."],
  ["demo_jorge", "¿Alguien sabe desde qué esquina se sacó esta foto?"],
  ["demo_maria", "Tengo una foto parecida en casa, la voy a buscar para subirla."],
  ["demo_carlos", "Me parece que el ángulo es el mismo que en la foto anterior."],
];

const CONTRIBUTIONS = [
  { clerk: "demo_carlos", type: "DATE", content: "Por la ropa y los vehículos, podría ser algunos años posterior a la fecha indicada.", yearOffset: 3 },
  { clerk: "demo_jorge", type: "LOCATION", content: "Creo que la toma fue hecha desde la vereda de enfrente, mirando hacia el norte." },
  { clerk: "demo_ana", type: "IDENTIFICATION", content: "El edificio del fondo podría ser un comercio que funcionó en la zona." },
  { clerk: "demo_maria", type: "HISTORICAL_FACT", content: "Según relatos familiares, en esa época se hacían reuniones de vecinos en este lugar." },
  { clerk: "demo_jorge", type: "CORRECTION", content: "El título debería mencionar el lugar exacto de la toma, no solo la zona." },
  { clerk: "demo_ana", type: "OTHER", content: "Sería bueno sumar más fotos de este mismo punto para comparar." },
];

const PLACES = [
  {
    name: "Plaza Eduardo Costa",
    kind: "plaza",
    category: "Plaza",
    latitude: -34.1683,
    longitude: -58.9583,
    description: "Plaza central de la ciudad. Descripción de ejemplo: contenido demo.",
    years: [1925, 1948, 1965, 1982, 2001, 2026],
  },
  {
    name: "Catedral Santa Florentina",
    kind: "templo",
    category: "Templo",
    latitude: -34.1691,
    longitude: -58.9571,
    description: "Templo del centro de la ciudad. Descripción de ejemplo: contenido demo.",
    years: [1930, 1952, 1978, 1995, 2018],
  },
  {
    name: "Estación Campana",
    kind: "estacion",
    category: "Transporte",
    latitude: -34.1652,
    longitude: -58.9611,
    description: "Estación ferroviaria. Descripción de ejemplo: contenido demo.",
    years: [1928, 1946, 1968, 1990, 2012],
  },
  {
    name: "Palacio Municipal",
    kind: "municipal",
    category: "Institucional",
    latitude: -34.1674,
    longitude: -58.9594,
    description: "Sede del gobierno municipal. Descripción de ejemplo: contenido demo.",
    years: [1940, 1962, 1987, 2008],
  },
  {
    name: "Avenida Ingeniero Agustín Rocca",
    kind: "avenida",
    category: "Avenida",
    latitude: -34.172,
    longitude: -58.955,
    description: "Avenida de acceso a la ciudad. Descripción de ejemplo: contenido demo.",
    years: [1958, 1976, 1999, 2021],
  },
  {
    name: "Puerto de Campana",
    kind: "puerto",
    category: "Puerto",
    latitude: -34.158,
    longitude: -58.953,
    description: "Zona portuaria sobre el río. Descripción de ejemplo: contenido demo.",
    years: [1935, 1955, 1980, 2003, 2024],
  },
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Sembrando datos demo...");

  const users = {};
  for (const u of DEMO_USERS) {
    users[u.clerkUserId] = await prisma.user.upsert({
      where: { clerkUserId: u.clerkUserId },
      update: { displayName: u.displayName },
      create: u,
    });
  }

  const cityData = {
    name: "Campana",
    province: "Buenos Aires",
    country: "Argentina",
    latitude: -34.1672,
    longitude: -58.9585,
    description:
      "Ciudad utilizada para mostrar el funcionamiento de MEMORIA. Las fotografías, fechas, comentarios y aportes cargados son contenido demo.",
    coverImageUrl: placeholderImage("plaza", "Campana", 1948),
  };
  const campana = await prisma.city.upsert({
    where: { slug: "campana" },
    update: cityData,
    create: { ...cityData, slug: "campana" },
  });

  let photoCount = 0;
  let commentCount = 0;
  let contributionCount = 0;

  for (let i = 0; i < PLACES.length; i++) {
    const { kind, years, ...p } = PLACES[i];
    const slug = slugify(p.name);

    const place = await prisma.place.upsert({
      where: { cityId_slug: { cityId: campana.id, slug } },
      update: p,
      create: { ...p, cityId: campana.id, slug },
    });

    // Regenera solo las fotos demo (comentarios y aportes caen en cascada).
    // También limpia fotos de usuarios demo creadas por versiones anteriores
    // del seed, cuando todavía no existía isDemo.
    await prisma.photo.deleteMany({
      where: {
        placeId: place.id,
        OR: [{ isDemo: true }, { uploadedBy: { clerkUserId: { startsWith: "demo_" } } }],
      },
    });

    for (let j = 0; j < years.length; j++) {
      const year = years[j];
      const url = placeholderImage(kind, p.name, year);
      const source = SOURCES[(i + j) % SOURCES.length];
      const recent = year >= 2000;
      const uploader = DEMO_USERS[(i + j) % DEMO_USERS.length].clerkUserId;

      const photo = await prisma.photo.create({
        data: {
          placeId: place.id,
          uploadedByUserId: users[uploader].id,
          originalImageUrl: url,
          imageUrl: url,
          title: `${p.name}, ${recent ? year : `c. ${year}`}`,
          description: `Ilustración de ejemplo de ${p.name} alrededor de ${year}. Contenido demo: no es una fotografía real ni documenta hechos históricos.`,
          yearFrom: year,
          yearTo: year,
          dateIsApproximate: !recent,
          photographer: j % 3 === 1 ? "Fotógrafo/a desconocido/a (demo)" : null,
          ...source,
          status: "PUBLISHED",
          isDemo: true,
        },
      });
      photoCount++;

      // Algunas fotos quedan sin comentarios/aportes para probar estados vacíos.
      const nComments = (i + j) % 4;
      for (let k = 0; k < nComments; k++) {
        const [clerk, content] = COMMENTS[(i * 2 + j + k) % COMMENTS.length];
        await prisma.comment.create({
          data: { photoId: photo.id, userId: users[clerk].id, content, isDemo: true },
        });
        commentCount++;
      }

      const nContributions = (i + j) % 3;
      for (let k = 0; k < nContributions; k++) {
        const c = CONTRIBUTIONS[(i + j * 2 + k) % CONTRIBUTIONS.length];
        await prisma.contribution.create({
          data: {
            photoId: photo.id,
            userId: users[c.clerk].id,
            type: c.type,
            content: c.content,
            proposedYearFrom: c.yearOffset ? year + c.yearOffset : undefined,
            isDemo: true,
          },
        });
        contributionCount++;
      }
    }
  }

  console.log(
    `Seed completo: 1 ciudad, ${PLACES.length} lugares, ${photoCount} fotos, ${commentCount} comentarios, ${contributionCount} aportes (todo demo).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
