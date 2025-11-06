# Protocolo TPDP (Técnicas de Programación y Desarrollo de Productos)

Este documento describe la implantación del protocolo TPDP en EduPlus Academy.
Incluye estructura de directorios, flujos de trabajo, herramientas, documentación técnica y pruebas.

## Objetivos
- Estandarizar prácticas de desarrollo y calidad.
- Alinear microservicios y frontend bajo criterios comunes.
- Facilitar CI/CD y trazabilidad.

## Componentes
- Estructura de proyecto: ver `directory-structure.md`.
- Flujos TPDP: ver `workflows.md`.
- Herramientas: ver `tools.md`.
- Pruebas: ver `testing.md`.
- Checklist de calidad: ver `quality-checklist.md`.

## Alcance inicial
- Backend: `services/evaluation-service` con pruebas unitarias e integración aisladas (mock DB).
- Frontend: `frontend` con pruebas unitarias de componentes críticos (Evaluación).
- CI: pipeline básico que ejecuta tests y reporta estado.