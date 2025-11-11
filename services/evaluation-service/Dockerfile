FROM node:18-alpine
WORKDIR /usr/src/app

# Copia package.json y lock para builds reproducibles
COPY package.json package-lock.json.
# Instala solo dependencias de producción usando el lock
RUN npm ci --omit=dev

# Copia el resto del código necesario para ejecutar
COPY src ./src
ENV PORT=5005
EXPOSE 5005
CMD ["node", "src/index.js"]