# Tryout SIMAK UI — full-stack (Express + Postgres) untuk Coolify.
FROM node:20-alpine

WORKDIR /app

# Install dependency (manfaatkan cache layer)
COPY package.json ./
RUN npm install --omit=dev

# Kode aplikasi
COPY server.js ./
COPY public ./public

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
