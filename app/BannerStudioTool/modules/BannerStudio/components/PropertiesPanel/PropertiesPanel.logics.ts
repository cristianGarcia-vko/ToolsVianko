/**
 * Safely reads a numeric px value from a CSS style property.
 * Agnostic utility for coordinate math and unit cleaning.
 */
export const readStylePxSafe = (value: unknown): number => {
    if (value == null) return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Base Agnostic Logic for PropertiesPanel.
 */
export const usePropertiesPanelBaseLogic = () => {
    // Currently purely helper based
    return {
        readStylePxSafe
    };
};
