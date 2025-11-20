# Tests de Integración EduPlus Academy

## Objetivo
Verificar que los microservicios respondan correctamente mediante llamadas HTTP reales.

## Requisitos
- Node 18+ (fetch global)
- Servicios levantados (Docker Compose en CI o local)

## Ejecutar
```bash
npm run test:integration
```

## Variables de entorno
- `AUTH_URL` (default: http://localhost:4000)
- `COURSE_URL` (default: http://localhost:3001)
- `EVAL_URL` (default: http://localhost:5005)

## Tests incluidos
- Auth Service: health, login/register sin credenciales
- Course Service: health, POST sin body
- Evaluation Service: health