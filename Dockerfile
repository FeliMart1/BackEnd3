# Imagen base de Node.js
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY package*.json ./
COPY . .

# Instalar dependencias
RUN npm install

# Exponer el puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
