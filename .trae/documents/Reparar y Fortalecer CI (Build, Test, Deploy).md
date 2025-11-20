## Diagnóstico de Fallos
- Variables de entorno ausentes en CI: `.env` no existía y los servicios quedaban en `Exited(1)`.
- Health-check basado en estado de Docker: el workflow esperaba `healthy`, no endpoints HTTP; expiraba.
- Compatibilidad `docker compose` v2 vs `docker-compose` v1 en runners.
- Lint del frontend rompía el pipeline por configuración ausente y demasiados errores.
- Deploy workflow ejecuta `npm run test:integration` sin levantar servicios; los tests fallan.
- Posibles timeouts de Postgres y puertos/EXPOSE inconsistentes (no fatales, pero confusos).

## Correcciones en Configuración y Scripts
- Crear `.env.example` y cargar `.env` en CI si falta.
- Desactivar `healthcheck` solo en CI (copiar `docker-compose.yml` a `docker-compose.ci.yml` con `healthcheck:` comentado).
- Sustituir espera de estado por health HTTP con `curl` a `auth:4000/health`, `course:3001/health`, `evaluation:5005/api/evaluations/health`.
- Detectar automáticamente el comando Compose (v1/v2) y usarlo en build/up/ps.
- Añadir paso de logs en fallo: `docker compose ps`, `docker compose logs` y subir como artefacto.
- Reintroducir `lint` gradualmente: configurar `.eslintrc.json`, ejecutar `eslint --quiet` y permitir warnings inicialmente; endurecer reglas por etapas.
- Añadir etapa `npm run test:unit` tras health endpoints en `CI` para validar utilidades; mantener integración como job opcional.
- Ajustar `deploy.yml`: antes de `test:integration` levantar stack con Compose (misma lógica de CI) o cambiar a unit tests como gating.
- Estabilizar build del frontend en CI: definir valores por defecto para `VITE_*` (o exportarlos en job) durante `npm run build`.

## Actualización de Dependencias y Herramientas
- Node 18 en todos los jobs; cache de npm con `actions/setup-node@v4`.
- Instalar `jq` y `curl` en `CI` para health y parsing.
- Asegurar Jest 29 con `--experimental-vm-modules` y `jest.config.js` ESM (ya aplicado).

## Monitoreo y Alerta
- Publicar artefactos: `docker-compose.ci.yml`, `docker ps`, `docker logs` al fallar.
- Notificación opcional a Slack/Discord vía webhook usando secretos (`SLACK_WEBHOOK_URL`).
- Resumen de job (Job Summary) con tiempos de arranque y códigos HTTP.

## Documentación
- Crear `docs/CI.md`: arquitectura del pipeline (jobs, pasos), variables requeridas, cómo ejecutar `workflow_dispatch`, y troubleshooting común.
- Añadir `docs/ENV.md`: mapeo de variables y origen (`.env`, `.env.example`, secrets).

## Validación
- Ejecutar `CI` en `workflow_dispatch` para validar end-to-end.
- Verificar:
  - Build de servicios y frontend completan.
  - Health endpoints devuelven `200` antes del timeout.
  - Unit tests pasan en runners.
  - Deploy workflow: o levanta servicios antes de integración, o pasa con unit tests como gating.
- Éxito: todos los jobs en verde en push/PR y manual, sin depender de estados `healthy` del engine.

¿Procedo a implementar los cambios en `ci.yml`, `deploy.yml`, `.env.example`, agregar los pasos de logs y las dos páginas de documentación (`docs/CI.md`, `docs/ENV.md`), y validar ejecutando el workflow manualmente?