# Imagen del backend de MEMORIA para Fly.io.
FROM node:20-slim

# Prisma necesita OpenSSL en tiempo de ejecución.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Se instalan también las devDependencies: el CLI de Prisma se usa en el
# release_command (migrate deploy) de fly.toml.
COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/server.js"]
