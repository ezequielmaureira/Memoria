// Seed de desarrollo para MEMORIA.
//
// IMPORTANTE: todos los textos y años de este seed son de EJEMPLO, creados
// para probar la aplicación. No representan hechos históricos verificados.
// Las imágenes son placeholders locales (SVG generados), no fotografías
// reales con copyright.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USER_CLERK_ID = "demo_seed_user";

function placeholderImage(label, tone) {
  // Placeholder SVG servido como data URL: evita depender de imágenes
  // externas con copyright durante el desarrollo.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="${tone}"/>
    <text x="50%" y="50%" font-family="serif" font-size="36" fill="#2a1f17" text-anchor="middle" dominant-baseline="middle">${label}</text>
    <text x="50%" y="58%" font-family="sans-serif" font-size="18" fill="#5a4a3a" text-anchor="middle">Imagen demo — MEMORIA</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function main() {
  console.log("Sembrando datos demo...");

  const demoUser = await prisma.user.upsert({
    where: { clerkUserId: DEMO_USER_CLERK_ID },
    update: {},
    create: {
      clerkUserId: DEMO_USER_CLERK_ID,
      displayName: "Vecino de Campana (demo)",
    },
  });

  const campana = await prisma.city.upsert({
    where: { slug: "campana" },
    update: {},
    create: {
      name: "Campana",
      province: "Buenos Aires",
      country: "Argentina",
      slug: "campana",
      latitude: -34.1667,
      longitude: -58.9594,
      description:
        "Ciudad demo utilizada para mostrar el funcionamiento de MEMORIA. Los lugares y fechas listados son de ejemplo.",
      coverImageUrl: placeholderImage("Campana", "#e7dcc8"),
    },
  });

  const placesData = [
    {
      name: "Plaza Eduardo Costa",
      category: "Plaza",
      latitude: -34.1683,
      longitude: -58.9583,
      description: "Plaza principal de la ciudad (contenido de ejemplo).",
      years: [1935, 1958, 1974, 1998, 2026],
    },
    {
      name: "Catedral Santa Florentina",
      category: "Templo",
      latitude: -34.1691,
      longitude: -58.9578,
      description: "Templo histórico del centro de la ciudad (contenido de ejemplo).",
      years: [1940, 1985, 2020],
    },
    {
      name: "Estación Campana",
      category: "Transporte",
      latitude: -34.1652,
      longitude: -58.9601,
      description: "Estación ferroviaria (contenido de ejemplo).",
      years: [1930, 1965, 2010],
    },
    {
      name: "Palacio Municipal",
      category: "Institucional",
      latitude: -34.1678,
      longitude: -58.9589,
      description: "Sede del gobierno municipal (contenido de ejemplo).",
      years: [1950, 1990, 2015],
    },
    {
      name: "Avenida Ingeniero Agustín Rocca",
      category: "Avenida",
      latitude: -34.172,
      longitude: -58.955,
      description: "Avenida principal de acceso (contenido de ejemplo).",
      years: [1960, 2000],
    },
    {
      name: "Puerto de Campana",
      category: "Puerto",
      latitude: -34.158,
      longitude: -58.953,
      description: "Zona portuaria histórica (contenido de ejemplo).",
      years: [1945, 1980, 2022],
    },
  ];

  const tones = ["#e7dcc8", "#d8c9ae", "#c9b896", "#e0d3ba", "#cebfa1", "#dccdb0"];

  for (let i = 0; i < placesData.length; i++) {
    const p = placesData[i];
    const slug = p.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const place = await prisma.place.upsert({
      where: { cityId_slug: { cityId: campana.id, slug } },
      update: {},
      create: {
        cityId: campana.id,
        name: p.name,
        slug,
        description: p.description,
        latitude: p.latitude,
        longitude: p.longitude,
        category: p.category,
      },
    });

    for (const year of p.years) {
      const existing = await prisma.photo.findFirst({
        where: { placeId: place.id, yearFrom: year },
      });
      if (existing) continue;

      const url = placeholderImage(`${p.name} — ${year}`, tones[i % tones.length]);
      await prisma.photo.create({
        data: {
          placeId: place.id,
          uploadedByUserId: demoUser.id,
          originalImageUrl: url,
          imageUrl: url,
          title: `${p.name} en ${year}`,
          description: `Fotografía de ejemplo de ${p.name} alrededor de ${year}. Contenido demo, no histórico.`,
          yearFrom: year,
          yearTo: year,
          dateIsApproximate: true,
          sourceType: "OTHER",
          sourceText: "Contenido de demostración",
          status: "PUBLISHED",
        },
      });
    }
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
