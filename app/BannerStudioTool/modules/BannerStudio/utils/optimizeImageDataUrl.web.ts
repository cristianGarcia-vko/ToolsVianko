type ImageOptimizeOptions = {
  maxWidth: number;
  maxHeight: number;
  maxPixels?: number;
  quality?: number; // 0..1
  sizeBypassBytes?: number; // if file is already <= this, return original dataUrl
};

const readFileAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = src;
  });

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const calcTargetSize = (
  width: number,
  height: number,
  opts: Pick<ImageOptimizeOptions, 'maxWidth' | 'maxHeight' | 'maxPixels'>
) => {
  const maxW = Math.max(1, opts.maxWidth);
  const maxH = Math.max(1, opts.maxHeight);
  const maxPx = opts.maxPixels && opts.maxPixels > 0 ? opts.maxPixels : undefined;

  const scaleByDim = Math.min(1, maxW / width, maxH / height);
  const scaleByPx = maxPx ? Math.min(1, Math.sqrt(maxPx / (width * height))) : 1;
  const scale = Math.min(scaleByDim, scaleByPx);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
};

const canEncodeWebp = (() => {
  let cached: boolean | null = null;
  return () => {
    if (cached != null) return cached;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const url = canvas.toDataURL('image/webp');
      cached = url.startsWith('data:image/webp');
      return cached;
    } catch {
      cached = false;
      return false;
    }
  };
})();

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      try {
        const url = canvas.toDataURL(type, quality);
        // Convert dataURL -> Blob
        const [head, b64] = url.split(',');
        const mime = head.match(/data:([^;]+);/i)?.[1] || type;
        const bin = atob(b64 || '');
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        resolve(new Blob([bytes], { type: mime }));
      } catch (e) {
        reject(e);
      }
      return;
    }
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('toBlob returned null'));
        else resolve(blob);
      },
      type,
      quality
    );
  });

export const optimizeImageFileToDataUrl = async (
  file: File,
  opts: ImageOptimizeOptions
): Promise<{ dataUrl: string; meta: { sourceBytes: number; outputBytes: number; width: number; height: number } }> => {
  const sizeBypassBytes = opts.sizeBypassBytes ?? 250_000;
  const quality = clamp01(opts.quality ?? 0.82);

  // Yield to keep the UI responsive before heavy work starts.
  await new Promise<void>((r) => setTimeout(() => r(), 0));

  // If it's already small, keep it as-is (fast path).
  if (file.size <= sizeBypassBytes) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      meta: { sourceBytes: file.size, outputBytes: file.size, width: 0, height: 0 },
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const srcW = Math.max(1, img.naturalWidth || img.width || 1);
    const srcH = Math.max(1, img.naturalHeight || img.height || 1);
    const target = calcTargetSize(srcW, srcH, opts);

    // If no resizing is needed, we can still re-encode to a smaller format.
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('No 2D context available');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, target.width, target.height);

    const preferWebp = canEncodeWebp();
    const isPng = String(file.type || '').toLowerCase().includes('png');
    const mime = preferWebp ? 'image/webp' : isPng ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : quality);
    const dataUrl = await readFileAsDataUrl(blob);

    return {
      dataUrl,
      meta: { sourceBytes: file.size, outputBytes: blob.size, width: target.width, height: target.height },
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

