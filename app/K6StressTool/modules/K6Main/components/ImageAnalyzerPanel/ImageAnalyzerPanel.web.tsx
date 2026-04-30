import React, { memo, useState, useEffect, useRef } from 'react';
import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    width: '100%',
    color: '#fff',
  },
  section: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  helper: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 12px 0',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  buttonPrimary: {
    backgroundColor: tokens.colors.accentPurple,
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    whiteSpace: 'nowrap' as const,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px',
    color: tokens.colors.accentGreen,
    fontFamily: 'monospace',
    fontSize: '12px',
    lineHeight: '1.4',
    resize: 'vertical' as const,
  },
  statusIndicator: {
    fontSize: '13px',
    marginTop: '12px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderLeft: `3px solid ${tokens.colors.accentPurple}`,
  }
};

export const ImageAnalyzerPanel: React.FC = memo(() => {
  const [targetPath, setTargetPath] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollInterval = useRef<any>(null);

  const startAnalysis = async () => {
    try {
      setError(null);
      setStatus({ status: 'iniciando...' });
      
      const res = await fetch('http://localhost:4001/api/image-analyzer/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPath })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al iniciar analisis');
      }
      
      const data = await res.json();
      setScanId(data.scanId);
    } catch (err: any) {
      setError(err.message);
      setStatus(null);
    }
  };

  const handlePickFolder = async () => {
    try {
      const res = await fetch('http://localhost:4001/api/image-analyzer/pick-folder');
      if (res.ok) {
        const data = await res.json();
        if (data.path) {
          setTargetPath(data.path);
        }
      }
    } catch (err) {
      console.error('Error abriendo el selector de carpetas', err);
    }
  };

  useEffect(() => {
    if (!scanId) return;

    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:4001/api/image-analyzer/status/${scanId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);

          if (data.status === 'completed' || data.status === 'error') {
            clearInterval(pollInterval.current);
          }
        }
      } catch (err) {
        console.error('Error polling status', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval.current);
  }, [scanId]);

  const renderStatus = () => {
    if (!status) return null;
    
    if (status.status === 'running') {
      return (
        <div style={styles.statusIndicator}>
          <strong>Analizando: </strong> 
          {status.progress 
            ? `Archivo ${status.progress.current} de ${status.progress.total} (${status.progress.file})`
            : 'Inicializando motor OCR...'}
        </div>
      );
    }
    
    if (status.status === 'completed') {
      return (
        <div style={{...styles.statusIndicator, borderLeftColor: tokens.colors.accentGreen}}>
          <strong>Completado: </strong> Se procesaron los archivos correctamente.
        </div>
      );
    }

    if (status.status === 'error') {
      return (
        <div style={{...styles.statusIndicator, borderLeftColor: tokens.colors.accentOrange}}>
          <strong>Error: </strong> {status.error}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.root}>
      <p style={styles.helper}>
        Extrae texto por OCR y metadatos tecnicos de imagenes locales (JPG, PNG, WEBP) usando procesamiento por lotes para evitar desbordamiento de memoria.
      </p>

      <div style={styles.section}>
        <div style={styles.label}>Directorio Local a Escanear</div>
        <p style={styles.helper}>
          Ingresa la ruta absoluta local en el servidor (ej. C:\Users\cristian.garcia\Pictures).
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            style={styles.input}
            value={targetPath}
            onChange={e => setTargetPath(e.target.value)}
            placeholder="C:\Ruta\Al\Directorio"
          />
          <button 
            type="button"
            style={styles.buttonSecondary}
            onClick={handlePickFolder}
            title="Abrir selector de carpetas"
          >
            📂 Explorar
          </button>
          <button 
            style={{
              ...styles.buttonPrimary, 
              opacity: !targetPath || status?.status === 'running' ? 0.5 : 1
            }}
            disabled={!targetPath || status?.status === 'running'}
            onClick={startAnalysis}
          >
            {status?.status === 'running' ? 'Analizando...' : 'Iniciar Analisis'}
          </button>
        </div>
        
        {error && <div style={{ color: tokens.colors.accentOrange, marginTop: '12px', fontSize: '13px' }}>{error}</div>}
        {renderStatus()}
      </div>

      {status?.status === 'completed' && status.results && (
        <div style={styles.section}>
          <div style={styles.label}>Resultados (analisis_repositorio.json)</div>
          <textarea 
            style={styles.textarea} 
            readOnly 
            value={JSON.stringify(status.results, null, 2)} 
          />
        </div>
      )}
    </div>
  );
});
