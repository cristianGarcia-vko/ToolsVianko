# ToolsVianko — Arquitectura

## Objetivo
Herramientas avanzadas para el ecosistema Vianko (Banner Studio, K6 Stress Testing). Diseñado para máxima fidelidad visual y rendimiento extremo (60 FPS).

## Estructura de Directorios
```
/ToolsVianko
  app/
    SharedTool/          # Componentes y lógica compartida entre herramientas
      atoms/             # Átomos UI (Fondo, Logo, Skeletons)
      modules/           # Módulos transversales (Hub)
    BannerStudioTool/    # Módulo de edición de banners
    K6StressTool/        # Módulo de auditoría de resiliencia (K6)
    store/               # Redux Store global con persistencia
  docs/                  # Documentación técnica
```

## Stack Tecnológico
- **Core**: React + Vite 6 (Web) / Expo (Native ready).
- **Bundler**: Vite 6 con code-splitting avanzado.
- **Styling**: Inline Styles + CSS-in-JS con Design Tokens centralizados.
- **Estado**: Redux Toolkit + Persistence (IndexedDB).
- **Animaciones**: Framer Motion + LazyMotion (Optimizado).

## Patrones Arquitectónicos
1. **Zero Logic in View**: Las vistas (.tsx) no deben contener lógica compleja. Se extrae a archivos `.logics.ts` (cuando aplica) o hooks especializados.
2. **Platform Isolation**: Uso de sufijos `.web.tsx` para optimizaciones específicas de navegador.
3. **Lazy Loading**: Los módulos pesados se cargan de forma diferida en el `HubModule`.

## Convenciones de Desarrollo
- Mantener paridad con los estándares de **ViankoSystems**.
- Priorizar rendimiento sobre complejidad visual innecesaria (evitar filtros GPU pesados en dispositivos móviles).
