FROM node:20-alpine
WORKDIR /app

# Copia package.json y lock para builds reproducibles
COPY package.json package-lock.json ./
# Instala solo dependencias de producción usando el lock
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

EXPOSE 10000
CMD ["npm", "start"]
