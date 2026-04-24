import { useCallback, useMemo, useState } from 'react';

type PrismaField = { name: string; type: string; isId: boolean; raw: string; dbName?: string };
type PrismaModelPayload = PrismaField[] | { tableName?: string; fields: PrismaField[] };
export type PrismaModels = Record<string, PrismaModelPayload>;
export type PrismaEnums = Record<string, string[]>;

const K6_API_BASE_URL =
  process.env.EXPO_PUBLIC_K6_API_BASE_URL ||
  'http://localhost:4001';
const API_BASE = `${K6_API_BASE_URL}/api/sqlgen`;

const safeJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const useSQLGeneratorMainLogic = () => {
  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [models, setModels] = useState<PrismaModels>({});
  const [enums, setEnums] = useState<PrismaEnums>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [startIds, setStartIds] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modelEntries = useMemo(() => Object.entries(models || {}), [models]);
  const hasModels = modelEntries.length > 0;

  const setDefaultsForModels = useCallback((nextModels: PrismaModels) => {
    setCounts((prev) => {
      const next = { ...prev };
      for (const modelName of Object.keys(nextModels)) {
        if (typeof next[modelName] !== 'number') next[modelName] = 10;
      }
      return next;
    });
    setStartIds((prev) => {
      const next = { ...prev };
      for (const modelName of Object.keys(nextModels)) {
        if (typeof next[modelName] !== 'number') next[modelName] = 1;
      }
      return next;
    });
  }, []);

  const handleAnalyzeSchema = useCallback(async () => {
    setError(null);
    if (!schemaFile) {
      setError('Selecciona un archivo schema.prisma primero.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('schema', schemaFile);

      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || data?.message || `Error HTTP ${res.status}`);
      }

      const data = await res.json();
      const parsed = (data?.models || {}) as PrismaModels;
      const parsedEnums = (data?.enums || {}) as PrismaEnums;
      setModels(parsed);
      setEnums(parsedEnums);
      setDefaultsForModels(parsed);
    } catch (e: any) {
      setError(e?.message || 'No se pudo analizar el schema.');
    } finally {
      setLoading(false);
    }
  }, [schemaFile, setDefaultsForModels]);

  const updateCount = useCallback((modelName: string, next: number) => {
    setCounts((prev) => ({ ...prev, [modelName]: Math.max(0, Number.isFinite(next) ? next : 0) }));
  }, []);

  const updateStartId = useCallback((modelName: string, next: number) => {
    setStartIds((prev) => ({ ...prev, [modelName]: Math.max(1, Number.isFinite(next) ? next : 1) }));
  }, []);

  const handleGenerateSQL = useCallback(async () => {
    setError(null);
    if (!hasModels) {
      setError('Primero analiza un schema.prisma.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models, enums, counts, startIds }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.error || data?.message || `Error HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'seed_pgadmin.sql';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || 'No se pudo generar el archivo SQL.');
    } finally {
      setLoading(false);
    }
  }, [counts, hasModels, models, startIds]);

  return {
    schemaFile,
    setSchemaFile,
    models,
    enums,
    modelEntries,
    counts,
    startIds,
    loading,
    error,
    hasModels,
    handleAnalyzeSchema,
    handleGenerateSQL,
    updateCount,
    updateStartId,
  };
};
