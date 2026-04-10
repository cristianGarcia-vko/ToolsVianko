/**
 * Plan JSON validator — validates a K6 plan config and returns field-level errors.
 */

export type PlanValidationError = {
    field: string;
    message: string;
};

export type PlanValidationResult = {
    valid: boolean;
    errors: PlanValidationError[];
    parsedPlan: any | null;
};

export const validatePlanJson = (jsonStr: string): PlanValidationResult => {
    const errors: PlanValidationError[] = [];
    let parsed: any = null;

    // 1. Parse JSON
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e: any) {
        return {
            valid: false,
            errors: [{ field: 'json', message: `JSON inválido: ${e.message || 'sintaxis incorrecta'}` }],
            parsedPlan: null,
        };
    }

    if (!parsed || typeof parsed !== 'object') {
        return {
            valid: false,
            errors: [{ field: 'json', message: 'El plan debe ser un objeto JSON' }],
            parsedPlan: null,
        };
    }

    // 2. Validate baseUrl
    const baseUrl = String(parsed.baseUrl || '').trim();
    if (!baseUrl) {
        errors.push({ field: 'baseUrl', message: 'baseUrl es requerido' });
    } else if (!/^https?:\/\/.+/.test(baseUrl)) {
        errors.push({ field: 'baseUrl', message: 'baseUrl debe iniciar con http:// o https://' });
    }

    // 3. Validate steps
    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        errors.push({ field: 'steps', message: 'Se necesita al menos 1 step (endpoint)' });
    } else {
        const enabledSteps = parsed.steps.filter((s: any) => s.enabled !== false);
        if (enabledSteps.length === 0) {
            errors.push({ field: 'steps', message: 'Al menos 1 step debe estar habilitado' });
        }

        parsed.steps.forEach((step: any, idx: number) => {
            if (!step.method || !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(step.method).toUpperCase())) {
                errors.push({ field: `steps[${idx}].method`, message: `Step ${idx + 1}: método HTTP inválido` });
            }
            if (!step.path || typeof step.path !== 'string') {
                errors.push({ field: `steps[${idx}].path`, message: `Step ${idx + 1}: path es requerido` });
            }
        });
    }

    // 4. Validate scenario
    if (parsed.scenario) {
        const sc = parsed.scenario;
        if (sc.executor === 'ramping-vus') {
            if (!Array.isArray(sc.stages) || sc.stages.length === 0) {
                errors.push({ field: 'scenario.stages', message: 'ramping-vus necesita al menos 1 stage' });
            }
        } else if (sc.executor === 'constant-vus' || !sc.executor) {
            if (sc.vus != null && (isNaN(Number(sc.vus)) || Number(sc.vus) < 1)) {
                errors.push({ field: 'scenario.vus', message: 'VUs debe ser al menos 1' });
            }
        }
    }

    // 5. Validate auth
    if (parsed.auth && parsed.auth.mode === 'login') {
        if (!parsed.auth.login?.path) {
            errors.push({ field: 'auth.login.path', message: 'Login path es requerido para auth mode "login"' });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        parsedPlan: parsed,
    };
};

export const getPlanSummary = (jsonStr: string): string | null => {
    try {
        const p = JSON.parse(jsonStr);
        const steps = Array.isArray(p.steps) ? p.steps.filter((s: any) => s.enabled !== false).length : 0;
        const scenario = p.scenario || {};
        const vus = scenario.vus || (scenario.stages ? `ramping (${scenario.stages.length} stages)` : '?');
        const dur = scenario.duration || (scenario.stages ? scenario.stages.map((s: any) => s.duration).join(' → ') : '?');
        return `${steps} endpoints · ${vus} VUs · ${dur}`;
    } catch {
        return null;
    }
};
