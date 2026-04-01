/**
 * Safely reads a numeric px value from a CSS style property.
 * Agnostic utility for coordinate math.
 */
export const readStylePx = (value: unknown): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(String(value ?? '0'));
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Base Agnostic Logic for LayerItemRenderer.
 * Could handle general coordinate snapping or state-agnostic math.
 * Currently serves as a bridge for the environment-specific logic.
 */
export const useLayerItemBaseLogic = () => {
    return {
        readStylePx
    };
};
