# Variables de Entorno

## .env.example
- JWT_SECRET=test_secret
- DATABASE_URL=postgres://postgres:postgres@postgres:5432/eduplus_test
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
- POSTGRES_DB=eduplus_test

## Carga en CI
- Si `.env` no existe, se copia desde `.env.example`.
- Cada servicio también recibe variables explícitas en `docker-compose.yml`.

## Frontend (Vite)
- Durante el build en CI se definen:
  - VITE_API_URL
  - VITE_COURSE_SERVICE_URL
  - VITE_AUTH_SERVICE_URL
  - VITE_EVALUATION_SERVICE_URL