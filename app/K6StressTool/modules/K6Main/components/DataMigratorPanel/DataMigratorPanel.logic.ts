import { useMemo, useState } from 'react';
import type { DataMigratorAnalysis, DataMigratorOutputFormat } from './DataMigratorPanel.types';
import {
  DATA_MIGRATOR_DEFAULT_MAPPING,
  DATA_MIGRATOR_ENDPOINTS,
  DATA_MIGRATOR_FORMAT_OPTIONS,
} from './DataMigratorPanel.shared';

const parseMappingOrNull = (text: string) => {
  if (!text || !text.trim()) return null;
  return JSON.parse(text);
};

export const useDataMigratorPanelLogic = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [schemaFile, setSchemaFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DataMigratorAnalysis | null>(null);
  const [mappingText, setMappingText] = useState(DATA_MIGRATOR_DEFAULT_MAPPING);
  const [outputFormat, setOutputFormat] = useState<DataMigratorOutputFormat>('sql');
  const [outputText, setOutputText] = useState('');
  const [outputFileName, setOutputFileName] = useState('migracion.sql');
  const [busy, setBusy] = useState<'idle' | 'analyzing' | 'converting'>('idle');
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = !!sourceFile && busy === 'idle';
  const canConvert = !!sourceFile && busy === 'idle';

  const previewColumns = useMemo(() => analysis?.columns || [], [analysis]);

  const handleSourceFileChange = (file: File | null) => {
    setSourceFile(file);
    setAnalysis(null);
    setOutputText('');
    setError(null);
  };

  const handleSchemaFileChange = (file: File | null) => {
    setSchemaFile(file);
    setError(null);
  };

  const buildFormData = (withOutputFormat = false) => {
    const formData = new FormData();
    if (sourceFile) formData.append('sourceFile', sourceFile);
    if (schemaFile) formData.append('schemaFile', schemaFile);
    formData.append('mappingConfig', mappingText);
    if (withOutputFormat) formData.append('outputFormat', outputFormat);
    return formData;
  };

  const analyze = async () => {
    if (!sourceFile) return;
    setBusy('analyzing');
    setError(null);
    try {
      const response = await fetch(DATA_MIGRATOR_ENDPOINTS.analyze, {
        method: 'POST',
        body: buildFormData(false),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'No se pudo analizar el archivo.');
      }
      setAnalysis(data as DataMigratorAnalysis);
      setMappingText(JSON.stringify(data.mappingConfig, null, 2));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error analizando archivo');
    } finally {
      setBusy('idle');
    }
  };

  const convert = async () => {
    if (!sourceFile) return;
    setBusy('converting');
    setError(null);
    try {
      parseMappingOrNull(mappingText);
      const response = await fetch(DATA_MIGRATOR_ENDPOINTS.convert, {
        method: 'POST',
        body: buildFormData(true),
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.error || 'No se pudo convertir el archivo.');
      }
      setOutputText(String(data?.content || ''));
      setOutputFileName(String(data?.fileName || `output.${outputFormat}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error convirtiendo archivo');
    } finally {
      setBusy('idle');
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = outputFileName || `output.${outputFormat}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return {
    sourceFile,
    schemaFile,
    analysis,
    mappingText,
    outputFormat,
    outputText,
    outputFileName,
    busy,
    error,
    canAnalyze,
    canConvert,
    previewColumns,
    outputFormatOptions: DATA_MIGRATOR_FORMAT_OPTIONS,
    setMappingText,
    setOutputFormat,
    handleSourceFileChange,
    handleSchemaFileChange,
    analyze,
    convert,
    downloadOutput,
  };
};
