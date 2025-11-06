# Pruebas TPDP

## Estrategia
- Unitarias: funciones y controladores aislados con mocks.
- Integración: rutas HTTP usando Supertest (backend) y render de componentes (frontend).
- Evitar dependencias externas (DB) en tests; usar mocks.

## Cobertura inicial
- `evaluation-service`: rutas de certificados (`/certificates/me`, `/certificates/:code`).
- `frontend`: componente `Evaluation.jsx` (estados de carga y resultado).

## Ejecución
- Backend: `cd services/evaluation-service && npm test`.
- Frontend: `cd frontend && npm run test`.