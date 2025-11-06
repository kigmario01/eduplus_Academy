# Estructura de archivos y directorios (TPDP)

La estructura monorepo se mantiene y se añaden convenciones TPDP:

```
docs/
  tpdp/
    README.md
    directory-structure.md
    workflows.md
    tools.md
    testing.md
    quality-checklist.md
.github/workflows/tpdp-ci.yml
.editorconfig

services/
  evaluation-service/
    src/app.js           # App Express exportable (para tests)
    src/index.js         # Punto de entrada (solo listen)
    jest.config.js       # Configuración de Jest
    __tests__/           # Pruebas unitarias/integración
      certificates.test.js

frontend/
  vitest.config.js       # Configuración de Vitest (jsdom)
  src/pages/Evaluation/__tests__/Evaluation.test.jsx
```

Convenciones:
- Separar inicialización del servidor (listen) de la configuración de la app para permitir pruebas.
- Ubicar pruebas en `__tests__/` por módulo/página.
- Documentación técnica bajo `docs/tpdp` con secciones claras.