# CI de EduPlus Academy

## Objetivos
- Build y verificación de microservicios con Docker Compose.
- Validación de endpoints de salud vía HTTP.
- Ejecución de pruebas unitarias.
- Build del frontend con Vite.

## Jobs
- backend-stack:
  - Detecta `docker compose` v2/v1.
  - Crea `.env` desde `.env.example` si falta.
  - Desactiva `healthcheck` solo en CI (`docker-compose.ci.yml`).
  - `build` + `up` de `postgres`, `auth-service`, `course-service`, `evaluation-service`.
  - Espera health endpoints (`/health`, `/api/evaluations/health`).
  - Ejecuta `npm run test:unit`.
- frontend-build:
  - Cache npm.
  - Build con valores por defecto `VITE_*`.

## Variables
- Se cargan desde `.env` y `.env.example`.
- Secrets recomendados: `SLACK_WEBHOOK_URL`, `VERCEL_*`, `RENDER_*`.

## Troubleshooting
- Endpoints no devuelven 200: revisar logs de Docker (artefactos en fallo).
- Compose v1/v2: el job detecta y usa el comando correcto.
- Lint: reintroducir gradualmente para no bloquear build.