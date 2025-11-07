# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Inyecta variables de API en el build de Vite
ARG VITE_API_URL
ARG VITE_COURSE_SERVICE_URL
ARG VITE_AUTH_SERVICE_URL
ARG VITE_EVALUATION_SERVICE_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_COURSE_SERVICE_URL=${VITE_COURSE_SERVICE_URL}
ENV VITE_AUTH_SERVICE_URL=${VITE_AUTH_SERVICE_URL}
ENV VITE_EVALUATION_SERVICE_URL=${VITE_EVALUATION_SERVICE_URL}
RUN npm run build

FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]