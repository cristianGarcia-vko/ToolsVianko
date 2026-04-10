export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

const toClassName = (value: ClassValue): string[] => {
  if (!value) return [];
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(toClassName);
  }
  return Object.entries(value)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);
};

export const cn = (...values: ClassValue[]): string =>
  values.flatMap(toClassName).join(' ');
