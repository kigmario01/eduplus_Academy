# Flujos de trabajo TPDP

## Desarrollo
- Crear rama descriptiva por funcionalidad.
- Añadir/actualizar pruebas y documentación.
- Ejecutar `npm test` en servicios y `npm run test` en frontend.
- Pull Request con checklist TPDP (ver `quality-checklist.md`).

## Revisión
- Verificar cobertura mínima de pruebas para cambios significativos.
- Confirmar integración con CI (`tpdp-ci.yml`).
- Validar estándares de estilo y estructura.

## Despliegue
- CI ejecuta tests y valida salud básica.
- Artefactos Docker existentes se mantienen; TPDP no altera el pipeline actual.