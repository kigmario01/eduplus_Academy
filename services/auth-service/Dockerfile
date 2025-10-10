FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 4000
# Variables esperadas: PORT, MONGO_URI, JWT_SECRET
CMD ["node","src/server.js"]