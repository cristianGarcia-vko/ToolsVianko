import type { BannerBackground, BannerDesign, BannerLayer, StudioProject } from './types';

export type ContractRole =
  | 'ADMIN'
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'GERENCIA'
  | 'SUPERVISOR'
  | 'EMPLEADO'
  | 'RH'
  | 'COORDINADOR'
  | 'CLIENTE';

export type ContractTransition = 'fade' | 'slide' | 'zoom' | 'none';

export type ContractBannerTools = {
  mode?: 'manual' | 'auto';
  autoplay?: boolean;
  intervalMs?: number;
  transition?: ContractTransition;
};

export type ContractBackground = {
  type?: 'color' | 'gradient' | 'image' | 'solid';
  bgType?: 'solid' | 'gradient' | 'image';
  value?: string;
  image?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  position?: string;
};

export type ContractAnimation = {
  name?: string;
  duration?: string;
  delay?: string;
  timingFunction?: string;
  easing?: string;
  iterationCount?: string | number;
  fillMode?: string;
};

export type ContractStyleMap = Record<string, string | number>;

export type ContractLayer = {
  id?: string;
  type: 'background' | 'canvas' | 'image' | 'text' | 'animated' | 'lottie' | 'particles' | 'group' | 'components';
  visible?: boolean;

  // Background-like layers
  bgType?: 'solid' | 'gradient' | 'image';
  value?: string;

  // Effects
  effect?: 'nodes' | 'particles' | 'hearts' | 'rain' | 'snow' | 'fire' | 'stars';
  intensity?: number;
  density?: number;
  color?: string;

  // Media
  src?: string;
  alt?: string;
  content?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  position?: string;

  // Animated
  assetType?: 'text' | 'image' | 'tag';
  tag?: string;

  // Interactions
  actionUrl?: string;

  // Styles
  styles?: ContractStyleMap;
  nativeStyles?: ContractStyleMap;
  imageStyles?: ContractStyleMap;
  nativeImageStyles?: ContractStyleMap;
  animation?: ContractAnimation;

  // Composition
  components?: ContractLayer[];
  mask?: string;
  media?: Record<string, ContractStyleMap>;

  // Lottie-ish
  source?: string;
  loop?: boolean;
  speed?: number;
  autoPlay?: boolean;
};

export type ContractBanner = {
  id?: string;
  duration?: number;
  width?: string;
  height?: string;
  designWidth?: number;
  designHeight?: number;
  aspectRatio?: number | string;
  actionUrl?: string;
  background?: ContractBackground;
  styles?: ContractStyleMap;
  nativeStyles?: ContractStyleMap;
  elements?: any[];
  layers: ContractLayer[];
  visibleFor?: ContractRole[];
};

export type ContractBannerMeta = {
  id: string;
  name: string;
  order: number;
};

export type ContractBannerItem = ContractBannerMeta & {
  banner: ContractBanner;
};

export type DashboardBannerContractPayload = {
  version?: string;
  exportedAt?: string;
  activeBannerId?: string;
  bannerTools?: ContractBannerTools;
  banner?: ContractBanner;
  banners?: ContractBanner[];
  availableBanners?: ContractBannerMeta[];
  bannerItems?: ContractBannerItem[];
};

export type ExtractedAsset = {
  filename: string;
  base64: string;
  mime?: string;
};

export type BuildContractResult = {
  payload: DashboardBannerContractPayload;
  assets: ExtractedAsset[];
  warnings: string[];
};

const ALLOWED_ROLES: readonly ContractRole[] = [
  'ADMIN',
  'ADMINISTRADOR',
  'GERENTE',
  'GERENCIA',
  'SUPERVISOR',
  'EMPLEADO',
  'RH',
  'COORDINADOR',
  'CLIENTE',
];

const ALLOWED_EFFECTS: readonly ContractLayer['effect'][] = [
  'nodes',
  'particles',
  'hearts',
  'rain',
  'snow',
  'fire',
  'stars',
];

const toSafeFiniteNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sanitizeStyleMap = (styles: any): ContractStyleMap | undefined => {
  if (!styles || typeof styles !== 'object') return undefined;
  const out: ContractStyleMap = {};
  Object.entries(styles).forEach(([key, raw]) => {
    if (raw == null) return;
    if (typeof raw === 'string') {
      const val = raw.trim();
      if (!val) return;
      out[key] = val;
      return;
    }
    if (typeof raw === 'number') {
      if (!Number.isFinite(raw)) return;
      out[key] = raw;
      return;
    }
  });
  return Object.keys(out).length ? out : undefined;
};

const sanitizeAnimation = (animation: any): ContractAnimation | undefined => {
  if (!animation || typeof animation !== 'object') return undefined;
  const out: ContractAnimation = {};
  if (typeof animation.name === 'string' && animation.name.trim()) out.name = animation.name.trim();
  if (typeof animation.duration === 'string' && animation.duration.trim()) out.duration = animation.duration.trim();
  if (typeof animation.delay === 'string' && animation.delay.trim()) out.delay = animation.delay.trim();
  if (typeof animation.timingFunction === 'string' && animation.timingFunction.trim())
    out.timingFunction = animation.timingFunction.trim();
  if (typeof animation.easing === 'string' && animation.easing.trim()) out.easing = animation.easing.trim();
  if (typeof animation.fillMode === 'string' && animation.fillMode.trim()) out.fillMode = animation.fillMode.trim();

  if (typeof animation.iterationCount === 'string' && animation.iterationCount.trim()) {
    out.iterationCount = animation.iterationCount.trim();
  } else if (typeof animation.iterationCount === 'number' && Number.isFinite(animation.iterationCount)) {
    out.iterationCount = animation.iterationCount;
  }

  return Object.keys(out).length ? out : undefined;
};

const safeFileToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

const parseImageDataUrl = (dataUrl: string) => {
  const trimmed = String(dataUrl || '').trim();
  if (!trimmed.startsWith('data:')) return null;
  const match = trimmed.match(/^data:([^;,]+);base64,(.+)$/i);
  if (!match) return null;
  const mime = match[1].trim().toLowerCase();
  if (!mime.startsWith('image/')) return null;
  const base64 = match[2];
  if (!base64) return null;
  return { mime, base64 };
};

const mimeToExt = (mime: string) => {
  const normalized = mime.toLowerCase();
  if (normalized.includes('svg')) return 'svg';
  if (normalized.includes('webp')) return 'webp';
  if (normalized.includes('jpeg')) return 'jpg';
  if (normalized.includes('jpg')) return 'jpg';
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('gif')) return 'gif';
  return 'png';
};

const normalizeRoles = (roles: unknown, warnings: string[], contextLabel: string): ContractRole[] | undefined => {
  if (!Array.isArray(roles)) return undefined;
  const cleaned = roles
    .map((r) => String(r || '').trim().toUpperCase())
    .filter(Boolean);
  const unique = Array.from(new Set(cleaned));
  const valid = unique.filter((r): r is ContractRole => (ALLOWED_ROLES as readonly string[]).includes(r));
  const invalid = unique.filter((r) => !valid.includes(r as any));
  if (invalid.length) {
    warnings.push(`${contextLabel}: roles ignorados por contrato: ${invalid.join(', ')}`);
  }
  return valid.length ? valid : undefined;
};

const sanitizeOptionalActionUrl = (value: unknown) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || undefined;
};

const buildContractBackground = (
  bannerId: string,
  bg: BannerBackground,
  opts: { externalizeAssets: boolean; assets: ExtractedAsset[]; warnings: string[] }
): ContractBackground | undefined => {
  if (!bg || typeof bg !== 'object') return undefined;

  if (bg.type === 'image') {
    const raw = String(bg.image || '').trim();
    if (!raw) return { type: 'image', bgType: 'image' };

    const data = parseImageDataUrl(raw);
    if (data && opts.externalizeAssets) {
      const ext = mimeToExt(data.mime);
      const filename = `bg_${safeFileToken(bannerId) || 'banner'}.${ext}`;
      opts.assets.push({ filename, base64: data.base64, mime: data.mime });
      const url = `/banner/assets/${filename}`;
      return {
        type: 'image',
        bgType: 'image',
        value: url,
        image: url,
        fit: (bg.fit as any) || 'cover',
        position: (bg as any).position || 'center',
      };
    }

    return {
      type: 'image',
      bgType: 'image',
      value: raw,
      image: raw,
      fit: (bg.fit as any) || 'cover',
      position: (bg as any).position || 'center',
    };
  }

  if (bg.type === 'gradient') {
    const angle = toSafeFiniteNumber(bg.gradient?.angle) ?? 90;
    const c1 = String(bg.gradient?.c1 || '#000').trim();
    const c2 = String(bg.gradient?.c2 || '#111').trim();
    return {
      type: 'gradient',
      bgType: 'gradient',
      value: `linear-gradient(${angle}deg, ${c1}, ${c2})`,
    };
  }

  if (bg.type === 'pattern') {
    const pattern = String((bg as any).pattern || 'dots').trim().toLowerCase();
    const scale = Math.max(4, toSafeFiniteNumber((bg as any).scale) ?? 18);
    const opacity = Math.min(1, Math.max(0, toSafeFiniteNumber((bg as any).opacity) ?? 0.15));
    const base = String((bg as any).color || '#0b1220').trim();
    const ink = `rgba(255,255,255,${opacity})`;

    const cssValue =
      pattern === 'grid'
        ? `linear-gradient(to right, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, linear-gradient(to bottom, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, ${base}`
        : pattern === 'waves'
          ? `repeating-radial-gradient(circle at 20% 20%, ${ink} 0 1px, transparent 1px ${scale}px), ${base}`
          : pattern === 'noise'
            ? `repeating-linear-gradient(45deg, ${ink} 0 1px, transparent 1px 3px), ${base}`
            : `radial-gradient(circle, ${ink} 1px, transparent 1px) 0 0 / ${scale}px ${scale}px repeat, ${base}`;

    return {
      type: 'gradient',
      bgType: 'gradient',
      value: cssValue,
    };
  }

  // default: color/solid
  const color = String((bg as any).color || '#0b1220').trim();
  return { type: 'color', bgType: 'solid', value: color };
};

const normalizeEffect = (effect: unknown): ContractLayer['effect'] | undefined => {
  const normalized = String(effect || '').trim().toLowerCase();
  if (!normalized) return undefined;
  if ((ALLOWED_EFFECTS as readonly string[]).includes(normalized)) return normalized as any;
  if (normalized === 'network') return 'nodes';
  return undefined;
};

const buildContractLayer = (
  bannerId: string,
  layer: BannerLayer,
  opts: { externalizeAssets: boolean; assets: ExtractedAsset[]; warnings: string[] }
): ContractLayer | null => {
  if (!layer || typeof layer !== 'object') return null;

  const base: Partial<ContractLayer> = {
    id: String(layer.id || '').trim() || undefined,
    visible: layer.visible,
    styles: sanitizeStyleMap(layer.styles),
    animation: sanitizeAnimation(layer.animation),
    actionUrl: sanitizeOptionalActionUrl(layer.actionUrl),
    mask: (layer as any).mask ? String((layer as any).mask).trim() : undefined,
    media: (layer as any).media,
  };

  const type = String(layer.type || '').trim();

  if (type === 'drawing') {
    // Treat drawings as images for contract.
    const imgSrc = String(layer.src || layer.value || '').trim();
    const res = buildContractLayer(bannerId, { ...layer, type: 'image', src: imgSrc } as any, opts);
    if (res) res.id = base.id;
    return res;
  }

  if (type === 'shape') {
    const backgroundColor = String((layer.styles as any)?.backgroundColor || (layer.styles as any)?.background || '#ffffff').trim();
    const bgLayer: ContractLayer = {
      ...(base as any),
      type: 'background',
      bgType: 'solid',
      value: backgroundColor || '#ffffff',
    };
    return bgLayer;
  }

  if (type === 'text') {
    const content = (layer.content ?? layer.value ?? '') as any;
    const textLayer: ContractLayer = {
      ...(base as any),
      type: 'text',
      tag: layer.tag ? String(layer.tag).trim() : 'div',
      content: String(content ?? ''),
    };
    return textLayer;
  }

  if (type === 'image') {
    const rawSrc = String(layer.src || layer.value || '').trim();
    const data = parseImageDataUrl(rawSrc);
    let finalSrc = rawSrc;
    if (data && opts.externalizeAssets) {
      const ext = mimeToExt(data.mime);
      const filename = `asset_${safeFileToken(layer.id || '') || safeFileToken(bannerId) || 'asset'}.${ext}`;
      opts.assets.push({ filename, base64: data.base64, mime: data.mime });
      finalSrc = `/banner/assets/${filename}`;
    }
    const imageLayer: ContractLayer = {
      ...(base as any),
      type: 'image',
      src: finalSrc || undefined,
      alt: layer.alt ? String(layer.alt).trim() : undefined,
      fit: (layer.fit as any) || 'contain',
      position: layer.position ? String(layer.position).trim() : 'center',
    };
    if (!imageLayer.src) return null;
    return imageLayer;
  }

  if (type === 'animated') {
    const resolvedAssetType: ContractLayer['assetType'] =
      (layer as any).assetType
      || (layer.src ? 'image' : (layer.content ? 'text' : 'text'));

    const tag = layer.tag ? String(layer.tag).trim() : resolvedAssetType === 'text' ? 'span' : 'div';

    if (resolvedAssetType === 'image') {
      const rawSrc = String(layer.src || layer.value || '').trim();
      const data = parseImageDataUrl(rawSrc);
      let finalSrc = rawSrc;
      if (data && opts.externalizeAssets) {
        const ext = mimeToExt(data.mime);
        const filename = `anim_${safeFileToken(layer.id || '') || safeFileToken(bannerId) || 'asset'}.${ext}`;
        opts.assets.push({ filename, base64: data.base64, mime: data.mime });
        finalSrc = `/banner/assets/${filename}`;
      }
      const animatedImageLayer: ContractLayer = {
        ...(base as any),
        type: 'animated',
        assetType: 'image',
        tag,
        src: finalSrc || undefined,
        fit: (layer.fit as any) || 'cover',
        position: layer.position ? String(layer.position).trim() : 'center',
      };
      if (!animatedImageLayer.src) return null;
      return animatedImageLayer;
    }

    const animatedTextLayer: ContractLayer = {
      ...(base as any),
      type: 'animated',
      assetType: resolvedAssetType === 'tag' ? 'tag' : 'text',
      tag,
      content: String(layer.content ?? layer.value ?? ''),
    };
    return animatedTextLayer;
  }

  if (type === 'particles') {
    const effect = normalizeEffect(layer.effect) || 'rain';
    return {
      ...(base as any),
      type: 'particles',
      effect: effect === 'nodes' ? 'particles' : (effect as any),
      density: toSafeFiniteNumber(layer.density),
      color: layer.color ? String(layer.color).trim() : undefined,
    };
  }

  if (type === 'canvas') {
    const effect = normalizeEffect(layer.effect) || 'nodes';
    return {
      ...(base as any),
      type: 'canvas',
      effect,
      intensity: toSafeFiniteNumber(layer.intensity),
      density: toSafeFiniteNumber(layer.density),
      color: layer.color ? String(layer.color).trim() : undefined,
    };
  }

  if (type === 'lottie') {
    const lottieLayer: ContractLayer = {
      ...(base as any),
      type: 'lottie',
      source: (layer.source || layer.src || layer.value) ? String(layer.source || layer.src || layer.value).trim() : undefined,
      loop: typeof (layer as any).loop === 'boolean' ? (layer as any).loop : true,
      autoPlay: typeof (layer as any).autoPlay === 'boolean' ? (layer as any).autoPlay : true,
      speed: toSafeFiniteNumber((layer as any).speed),
    };
    return lottieLayer;
  }

  // Unknown internal type -> try to preserve as text (best-effort) but warn.
  opts.warnings.push(`Banner ${bannerId}: capa "${layer.id}" tipo no soportado (${type}). Se exporta como text.`);
  return {
    ...(base as any),
    type: 'text',
    tag: 'div',
    content: String(layer.content ?? layer.value ?? layer.name ?? ''),
  };
};

const buildContractBanner = (
  banner: BannerDesign,
  index: number,
  opts: { externalizeAssets: boolean; assets: ExtractedAsset[]; warnings: string[] }
): ContractBanner => {
  const width = Number(banner.designWidth || 800);
  const height = Number(banner.designHeight || 220);

  const visibleFor = normalizeRoles(banner.visibilityRoles, opts.warnings, `Banner ${banner.id}`); // omit if empty/invalid
  const layers: ContractLayer[] = (banner.layers || [])
    .map((layer) => buildContractLayer(banner.id, layer, opts))
    .filter(Boolean) as ContractLayer[];

  const background = buildContractBackground(banner.id, banner.background, opts);

  const styles: ContractStyleMap = {
    borderRadius: String((banner.styles as any)?.borderRadius || '12px'),
    position: 'relative',
    overflow: 'hidden',
    ...(sanitizeStyleMap(banner.styles) || {}),
  };

  const bannerObj: ContractBanner = {
    id: banner.id,
    width: '100%',
    height: `${height}px`,
    designWidth: width,
    designHeight: height,
    aspectRatio: height > 0 ? width / height : undefined,
    actionUrl: sanitizeOptionalActionUrl(banner.actionUrl),
    background,
    styles,
    nativeStyles: { overflow: 'hidden' },
    ...(visibleFor ? { visibleFor } : {}),
    layers,
  };

  return bannerObj;
};

export const buildDashboardBannerContractFromProject = (
  project: StudioProject,
  options?: { externalizeAssets?: boolean }
): BuildContractResult => {
  const warnings: string[] = [];
  const assets: ExtractedAsset[] = [];
  const externalizeAssets = Boolean(options?.externalizeAssets);

  const orderedBanners = (project.banners || []).map((b, i) => ({ b, i }));
  const canonicalBanners = orderedBanners.map(({ b, i }) =>
    buildContractBanner(b, i, { externalizeAssets, assets, warnings })
  );

  const desiredActiveId = String(project.activeBannerId || '').trim();
  const activeBanner =
    (desiredActiveId ? canonicalBanners.find((b) => b.id === desiredActiveId) : null) || canonicalBanners[0];

  const rawIntervalMs =
    toSafeFiniteNumber((project.settings as any)?.intervalMs)
    ?? (toSafeFiniteNumber(project.settings?.transitionTime) != null ? (project.settings!.transitionTime * 1000) : undefined)
    ?? 6000;

  const intervalMs = Math.max(1000, Math.round(rawIntervalMs));

  const transition =
    (project.settings as any)?.transition === 'fade'
    || (project.settings as any)?.transition === 'slide'
    || (project.settings as any)?.transition === 'zoom'
    || (project.settings as any)?.transition === 'none'
      ? ((project.settings as any)?.transition as ContractTransition)
      : 'fade';

  const autoplay = Boolean(project.settings?.autoplay);
  const canAutoRotate = autoplay && canonicalBanners.length >= 2;
  const mode =
    ((project.settings as any)?.mode === 'manual' || (project.settings as any)?.mode === 'auto')
      ? ((project.settings as any)?.mode as 'manual' | 'auto')
      : (canAutoRotate ? 'auto' : 'manual');

  const bannerTools: ContractBannerTools = {
    mode: canAutoRotate ? mode : 'manual',
    autoplay,
    intervalMs,
    transition,
  };

  if (bannerTools.mode === 'auto' && bannerTools.autoplay && canonicalBanners.length < 2) {
    // Schema requires 2+ banners when auto+autoplay. Force manual if needed.
    bannerTools.mode = 'manual';
    warnings.push('Autoplay activo con 1 banner: se exporta mode=manual para cumplir contrato.');
  }

  const payload: DashboardBannerContractPayload = {
    version: 'multi-banner-v2-role-aware',
    exportedAt: new Date().toISOString(),
    activeBannerId: activeBanner?.id,
    bannerTools,
    banner: activeBanner,
    banners: canonicalBanners,
    availableBanners: (project.banners || []).map((b, i) => ({ id: b.id, name: b.name, order: i })),
    bannerItems: (project.banners || []).map((b, i) => ({
      id: b.id,
      name: b.name,
      order: i,
      banner: canonicalBanners[i],
    })),
  };

  return { payload, assets, warnings };
};
