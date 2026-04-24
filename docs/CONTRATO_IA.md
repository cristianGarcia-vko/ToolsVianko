# Contrato de Desarrollo para IAs (ToolsVianko)

Este contrato es la directiva principal para cualquier Agente de IA que interactúe con ToolsVianko. Sincronizado con los estándares de **ViankoSystems**.

---

## 1. Reglas de Implementación
- **No Lógica en la Vista**: No definas funciones complejas dentro del componente funcional. Extrae a un hook o archivo de lógica.
- **Tokens de Diseño**: No uses colores hardcoded. Usa siempre el objeto `theme` o `tokens`.
- **LazyMotion**: Usa siempre `m.div` en lugar de `motion.div` cuando el modo estricto esté activo, o asegura que el uso de `motion` no rompa el tree-shaking.

## 2. Rendimiento
- Antes de añadir un efecto visual (Blur, Gradiente Radial, Animación), evalúa su impacto en la GPU.
- Usa `willChange` para elementos con animaciones frecuentes (ej. capas en Banner Studio).

## 3. Eficiencia de Tokens (IA)
- **Modificaciones Parciales**: No re-generes archivos completos si solo cambias una parte pequeña.
- **Conocimiento del Entorno**: Consulta `docs/INVENTORY.md` antes de proponer un nuevo componente.

---
*Este contrato es vinculante para Antigravity y otros agentes.*
