# Imagen base de Node
FROM node:18-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias primero (para aprovechar cache)
COPY package*.json ./

# Instala dependencias de producción
RUN npm install --production

# Copia el resto del código
COPY . .

# Expone el puerto que usará el servicio
EXPOSE 5002

# Comando para iniciar el servidor
CMD ["npm", "start"]
