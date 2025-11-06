# Imagen base de Node
FROM node:18-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias primero (para aprovechar cache)
COPY package.json package-lock.json ./

# Instala dependencias de producción de forma reproducible
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# Expone el puerto que usará el servicio
EXPOSE 5002

# Comando para iniciar el servidor
CMD ["npm", "start"]
