export type ModuleGuideSection = {
    title: string;
    items: string[];
};

export type ModuleGuide = {
    badge: string;
    title: string;
    summary: string;
    sections: ModuleGuideSection[];
    exampleTitle?: string;
    exampleCode?: string;
    note?: string;
};

export const k6ModuleGuides = {
    discovery: {
        badge: 'Discovery',
        title: 'Descubridor central de endpoints',
        summary: 'Analiza un ZIP del servidor para detectar rutas y compartirlas con el resto de modulos.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['Un archivo .zip del backend o modulo con rutas/controladores.', 'El ZIP debe conservar estructura de carpetas y codigo fuente legible.'] },
            { title: 'Formato esperado', items: ['Solo se acepta .zip.', 'Este modulo no requiere captura manual de endpoints.'] },
            { title: 'Secuencia recomendada', items: ['1. Carga el ZIP.', '2. Presiona Analizar ZIP.', '3. Revisa endpoints detectados.', '4. Usa Pasar a plan o deja que otros modulos consuman la salida.'] },
        ],
        exampleTitle: 'Ejemplo puntual',
        exampleCode: 'backend-api.zip',
        note: 'Si el ZIP esta minificado o no contiene rutas fuente, la deteccion puede quedar incompleta.',
    },
    dashboard: {
        badge: 'Dashboard',
        title: 'Dashboard de rendimiento',
        summary: 'Resume salud, error rate, RPS y latencia del ultimo reporte ejecutado.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['No recibe datos manuales.', 'Necesita que ya exista una prueba ejecutada.'] },
            { title: 'Como leerlo', items: ['HEALTH alto indica estabilidad general.', 'ERR RATE alto sugiere fallos o saturacion.', 'p95 y p99 altos indican degradacion perceptible para usuarios.'] },
            { title: 'Secuencia recomendada', items: ['1. Ejecuta una prueba.', '2. Revisa este resumen.', '3. Baja a QA Analysis para detalle por endpoint.'] },
        ],
        note: 'Este modulo es de lectura; no configura pruebas.',
    },
    qaAnalysis: {
        badge: 'QA',
        title: 'Perfil QA y analisis de errores',
        summary: 'Contrasta codigos HTTP y detalle de endpoints para detectar rutas degradadas.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['Con Discovery mostrara endpoints hallados.', 'Con una corrida K6 mostrara latencias y estado por endpoint.'] },
            { title: 'Como interpretarlo', items: ['Latencias altas en rutas criticas requieren revision.', 'Estados degradados o stressed indican prioridad de correccion.'] },
            { title: 'Secuencia recomendada', items: ['1. Descubre endpoints o ejecuta prueba.', '2. Revisa codigos HTTP.', '3. Prioriza endpoints lentos o con error.'] },
        ],
    },
    insights: {
        badge: 'Insights',
        title: 'Decision Insights',
        summary: 'Entrega una lectura guiada para usuarios tecnicos y no tecnicos.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['No requiere entrada manual.', 'Se alimenta del reporte actual y KPIs ya calculados.'] },
            { title: 'Que resultado entrega', items: ['Recomendaciones de escalado o investigacion.', 'Senales ejecutivas para decidir si seguir o detener pruebas.'] },
            { title: 'Secuencia recomendada', items: ['1. Ejecuta prueba.', '2. Revisa Dashboard.', '3. Usa Insights como resumen ejecutivo.'] },
        ],
    },
    orchestrator: {
        badge: 'Runner',
        title: 'Orchestrator y plan runner',
        summary: 'Configura URL base, autenticacion, usuarios, duracion y plan JSON para lanzar pruebas K6.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['PROTO: http:// o https://.', 'HOST: dominio o IP sin protocolo. Ejemplo: api.midominio.com.', 'PORT: puerto numerico. Ejemplo: 3000.', 'ROUTE opcional: ruta concreta. Ejemplo: /health.', 'BEARER TOKEN opcional para endpoints protegidos.'] },
            { title: 'Formato esperado', items: ['HOST sin barra final.', 'ROUTE iniciando con /.', 'PLAN CONFIG en JSON valido.'] },
            { title: 'Secuencia recomendada', items: ['1. Define base URL y token.', '2. Ajusta usuarios y duracion.', '3. Usa prueba simple o Enviar plan para escenario completo.'] },
        ],
        exampleTitle: 'Ejemplo puntual',
        exampleCode: '{\n  "baseUrl": "https://api.midominio.com",\n  "duration": "60s",\n  "vus": 20,\n  "endpoints": [\n    { "method": "GET", "path": "/health" },\n    { "method": "GET", "path": "/usuario/1" }\n  ]\n}',
    },
    monitor: {
        badge: 'Monitor',
        title: 'Panel de monitoreo proactivo',
        summary: 'Toma endpoints detectados o manuales y los evalua contra el backend de monitoreo.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['Nombre del proyecto.', 'Endpoints con metodo, URL completa y token opcional.', 'Payload JSON solo si el endpoint requiere body.'] },
            { title: 'Formato esperado', items: ['URL completa. Ejemplo: https://api.midominio.com/usuario/1.', 'Payload como texto JSON. Ejemplo: { "name": "test" }.', 'Token segun tu flujo actual de autenticacion.'] },
            { title: 'Secuencia recomendada', items: ['1. Importa endpoints o agrega uno manual.', '2. Completa token y payload si aplica.', '3. Inicia monitoreo.', '4. Guarda registro si el resultado es util.'] },
        ],
    },
    history: {
        badge: 'History',
        title: 'Historial de ejecuciones',
        summary: 'Muestra pruebas recientes para identificar que se corrio y cuando.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['No recibe entrada manual.', 'Depende de reportes ya registrados por el backend.'] },
            { title: 'Como usarlo', items: ['Confirma hora y nombre del proyecto.', 'Valida si una corrida reciente ya genero salida antes de repetir pruebas.'] },
        ],
    },
    sqlSeed: {
        badge: 'SQL',
        title: 'SQL Seed Generator',
        summary: 'Genera inserts para poblar base de datos antes de correr pruebas de carga.',
        sections: [
            { title: 'Que necesitas proporcionar', items: ['schema.prisma o modelos necesarios.', 'Cantidad de registros por modelo e IDs iniciales.'] },
            { title: 'Formato esperado', items: ['Modelos Prisma validos.', 'Cantidades numericas coherentes con relaciones.'] },
            { title: 'Secuencia recomendada', items: ['1. Abre el generador.', '2. Carga o pega tu schema.', '3. Define volumen por modelo.', '4. Genera el SQL para preparar datos previos a la prueba.'] },
        ],
    },
} as const satisfies Record<string, ModuleGuide>;

export type ModuleGuideKey = keyof typeof k6ModuleGuides;
