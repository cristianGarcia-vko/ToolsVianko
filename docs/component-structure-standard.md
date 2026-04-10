# Estandar de Estructura para `app/subApp`

## Objetivo
Separar claramente:

- Estructura/render
- Logica
- Estilos
- Datos compartidos, tipos y configuracion

El archivo de estructura no debe concentrar hooks, helpers, estilos inline complejos ni reglas de negocio.

## Regla principal
Los archivos de estructura deben limitarse a:

- componer JSX
- recibir props
- delegar calculos a `logic`
- delegar estilos a `styles`
- reutilizar datos puros desde `shared`, `content`, `config` o `types`

## Convencion recomendada

### Atomos
- `Componente.web.tsx`: estructura web
- `Componente.native.tsx`: estructura native
- `Componente.logic.ts`: logica compartida
- `Componente.web.logic.ts[x]`: logica exclusiva web
- `Componente.native.logic.ts[x]`: logica exclusiva native
- `Componente.web.styles.ts`: estilos web
- `Componente.native.styles.ts`: estilos native
- `Componente.shared.ts`: constantes, mappers puros, tipos de datos compartidos
- `Componente.types.ts`: tipos de props y modelos de vista

### Modulos
- `Modulo.web.tsx` / `Modulo.native.tsx`: solo estructura
- `Modulo.logic.ts`: hooks, side effects, handlers y modelos derivados
- `Modulo.web.styles.ts` / `Modulo.native.styles.ts`: estilos
- `Modulo.shared.ts`: helpers puros, copy o configuracion multiplataforma

### Screens
- `Screen.web.tsx` / `Screen.native.tsx`: composicion de layout
- `Screen.logic.ts`: efectos, estado y derivacion de datos
- `Screen.web.styles.ts` / `Screen.native.styles.ts`: estilos
- `Screen.shared.ts`: constantes, modelos y helpers puros

## Que no debe quedar en un archivo de estructura
- hooks como `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`
- funciones helper grandes
- variantes de animacion
- objetos de estilo locales
- `style={{ ... }}` complejos y repetidos
- logica de transformacion de datos
- reglas de permisos o navegacion

## Excepciones validas
- JSX pequeno y declarativo
- props de accesibilidad
- `style` puntual pasado desde afuera
- constantes visuales triviales de una sola linea si no ameritan archivo propio
