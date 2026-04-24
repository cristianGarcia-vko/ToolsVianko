# Plan de Sincronización Arquitectónica — ToolsVianko vs ViankoSystems

Este documento establece la hoja de ruta para alinear **ToolsVianko** con los estándares maduros de **ViankoSystems**.

## 1. Auditoría de Diferencias Actuales

| Característica | ToolsVianko (Actual) | ViankoSystems (Target) | Prioridad |
| :--- | :--- | :--- | :--- |
| **Directorio de Componentes** | `SharedTool/atoms` | `app/components/atoms` | Media |
| **Gestión de Estilos** | CSS-in-JS / Inline | Tailwind v4 + Variables CSS | Alta |
| **Tokens de Diseño** | Objetos JS en `tokens.shared.style.ts` | JSON + Scripts de construcción | Alta |
| **Separación de Lógica** | Parcial (algunos `.logics.ts`) | Estricta (`.logic.ts` para cada componente) | Alta |
| **Router** | State-based (HubModule) | React Router DOM (Browser router) | Baja |

## 2. Pasos para la Sincronización

### Fase 1: Estandarización de Estilos (Inmediata)
1. **Migración a Variables CSS**: Convertir los objetos de `tokens.shared.style.ts` en variables CSS inyectadas en el root. Esto permitirá usar `var(--color-...)` en lugar de importar objetos pesados.
2. **Evaluación de Tailwind v4**: Analizar si es factible introducir Tailwind v4 para los nuevos componentes, manteniendo la compatibilidad con los estilos actuales.

### Fase 2: Reestructuración de Archivos (Organizativa)
1. Mover `SharedTool/atoms` a una estructura más plana: `app/components/atoms`.
2. Renombrar `SharedTool/modules` a `app/components/modules`.
3. Asegurar que cada átomo tenga su trío: `.web.tsx`, `.logic.ts`, `.styles.ts`.

### Fase 3: Unificación de Core (`src/`)
1. Crear una carpeta `src/` en ToolsVianko para mover la lógica de API, Auth y Utils, separándola de la carpeta `app/` (UI).
2. Sincronizar el `ViankoSplashRevealAtom` para que sea el mismo componente exacto (referencia compartida).

## 3. Beneficios Esperados
- **Interoperabilidad**: Poder copiar y pegar módulos entre ambos proyectos sin cambios de código.
- **Eficiencia de IA**: Los agentes podrán operar en ambos proyectos con el mismo set de reglas y expectativas.
- **Rendimiento**: Menor carga de JS al delegar estilos al motor CSS del navegador.
