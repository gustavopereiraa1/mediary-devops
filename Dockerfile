# Etapa 1: compila o front-end React (Vite) para a pasta dist
FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public/ public/
COPY src/ src/
RUN npm run build

# Etapa 2: imagem final, só com o servidor Node e o front compilado
FROM node:24-alpine

WORKDIR /opt/mediary
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ server/
COPY --from=build /app/dist dist/

# Porta do servidor Express (server/server.js)
EXPOSE 3000

CMD ["npm", "start"]
