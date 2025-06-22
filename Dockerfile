# Dockerfile
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json + lockfile e instalar solo deps de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar todo el código
COPY . .

# Definir entorno
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 3000

# Comando por defecto: lanzar src/app.js
CMD ["node", "src/app.js"]
