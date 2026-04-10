import { tokens } from '../../../../../SharedTool/style/tokens.shared.style';

type WizardStepState = 'done' | 'active' | 'pending';

const accentClassMap: Record<string, string> = {
  'vianko-green': 'accent-green',
  'vianko-teal': 'accent-teal',
  'vianko-blue': 'accent-blue',
  'vianko-purple': 'accent-purple',
  'vianko-orange': 'accent-orange',
  'vianko-danger': 'accent-danger',
};

const methodClassMap: Record<string, string> = {
  GET: 'accent-green',
  POST: 'accent-blue',
  PUT: 'accent-orange',
  PATCH: 'accent-purple',
  DELETE: 'accent-danger',
};

const resolveAccentClass = (accent: string) => accentClassMap[accent] ?? 'accent-teal';

const resolveButtonClass = (accent: string, outlined = false) => {
  if (outlined && accent.startsWith('rgba(')) {
    return 'k6wiz-btn k6wiz-btn--ghost';
  }
  const toneClass = resolveAccentClass(accent);
  return outlined
    ? `k6wiz-btn k6wiz-btn--outline ${toneClass}`
    : `k6wiz-btn k6wiz-btn--solid ${toneClass}`;
};

export const wizardStyles = {
  overlay: 'k6wiz-overlay',
  container: 'k6wiz-panel',
  header: 'k6wiz-header',
  headerTitle: 'k6wiz-header-title',
  stepper: 'k6wiz-stepper',
  stepDot: (state: WizardStepState) => `k6wiz-step-dot is-${state}`,
  stepLabels: 'k6wiz-step-labels',
  stepLabel: (state: WizardStepState) => `k6wiz-step-label is-${state}`,
  body: 'k6wiz-body',
  stepTitle: 'k6wiz-step-title',
  stepSubtitle: 'k6wiz-step-subtitle',
  fieldGroup: 'k6wiz-field-group',
  fieldLabel: 'k6wiz-field-label',
  fieldInput: 'k6wiz-field-input',
  fieldRow: 'k6wiz-field-row',
  presetGrid: 'k6wiz-preset-grid',
  presetCard: (active: boolean, accent: string) =>
    `k6wiz-preset-card ${resolveAccentClass(accent)}${active ? ' is-active' : ''}`,
  presetIcon: 'k6wiz-preset-icon',
  presetName: (active: boolean, accent: string) =>
    `k6wiz-preset-name ${resolveAccentClass(accent)}${active ? ' is-active' : ''}`,
  presetDesc: 'k6wiz-preset-desc',
  sliderGroup: 'k6wiz-slider-group',
  sliderRow: 'k6wiz-slider-row',
  sliderTrack: 'wiz-slider k6wiz-slider-track',
  sliderVal: (accent: string) => `k6wiz-slider-val ${resolveAccentClass(accent)}`,
  endpointList: 'k6wiz-endpoint-list',
  endpointRow: (enabled: boolean) => `k6wiz-endpoint-row${enabled ? ' is-enabled' : ' is-disabled'}`,
  methodBadge: (method: string) => `k6wiz-method-badge ${methodClassMap[method] ?? 'accent-teal'}`,
  endpointPath: 'k6wiz-endpoint-path',
  endpointAction: 'k6wiz-endpoint-action',
  footer: 'k6wiz-footer',
  navBtn: (accent: string, outlined = false) => resolveButtonClass(accent, outlined),
  closeBtn: 'k6wiz-close-btn',
  keyframes: `
    @keyframes wizOverlayIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes wizPanelIn {
      from { transform: translateY(40px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    @keyframes wizPulse {
      0%, 100% { box-shadow: 0 0 0 rgba(45, 212, 191, 0); }
      50% { box-shadow: 0 0 26px rgba(45, 212, 191, 0.18); }
    }

    .k6wiz-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background:
        radial-gradient(circle at top, rgba(45, 212, 191, 0.10), transparent 35%),
        radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.10), transparent 30%),
        rgba(3, 6, 14, 0.72);
      backdrop-filter: blur(14px);
      animation: wizOverlayIn 0.25s ease-out;
    }

    .k6wiz-panel {
      position: relative;
      width: min(100%, 980px);
      max-height: min(88vh, 960px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background:
        linear-gradient(180deg, rgba(13, 20, 34, 0.98) 0%, rgba(7, 10, 18, 0.98) 100%);
      box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.72),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
      animation: wizPanelIn 0.3s ease-out;
    }

    .k6wiz-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at top left, rgba(45, 212, 191, 0.14), transparent 28%),
        radial-gradient(circle at 85% 12%, rgba(46, 229, 157, 0.12), transparent 24%);
      opacity: 0.9;
    }

    .k6wiz-header,
    .k6wiz-body,
    .k6wiz-footer {
      position: relative;
      z-index: 1;
    }

    .k6wiz-header {
      padding: 28px 30px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0));
    }

    .k6wiz-header-title {
      margin-bottom: 16px;
      color: ${tokens.colors.accentTeal};
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 2.4px;
      text-transform: uppercase;
      text-shadow: 0 0 18px rgba(45, 212, 191, 0.24);
    }

    .k6wiz-stepper {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .k6wiz-step-dot {
      flex: 1;
      height: 6px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      transition: all 0.25s ease;
    }

    .k6wiz-step-dot.is-done {
      background: linear-gradient(90deg, ${tokens.colors.accentGreen}, ${tokens.colors.accentTeal});
      box-shadow: 0 0 18px rgba(46, 229, 157, 0.22);
    }

    .k6wiz-step-dot.is-active {
      background: linear-gradient(90deg, ${tokens.colors.accentBlue}, ${tokens.colors.accentTeal});
      box-shadow: 0 0 18px rgba(34, 211, 238, 0.26);
      animation: wizPulse 1.8s ease-in-out infinite;
    }

    .k6wiz-step-labels {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
    }

    .k6wiz-step-label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 0;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.24);
      text-align: center;
      transition: color 0.2s ease;
    }

    .k6wiz-step-label.is-active {
      color: rgba(255, 255, 255, 0.84);
    }

    .k6wiz-step-label.is-done {
      color: ${tokens.colors.accentGreen};
    }

    .k6wiz-body {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 26px 30px 24px;
      overflow-y: auto;
    }

    .k6wiz-body::-webkit-scrollbar,
    .k6wiz-endpoint-list::-webkit-scrollbar {
      width: 8px;
    }

    .k6wiz-body::-webkit-scrollbar-thumb,
    .k6wiz-endpoint-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 999px;
    }

    .k6wiz-step-title {
      margin: 0;
      color: ${tokens.colors.textMain};
      font-size: clamp(28px, 3vw, 36px);
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.04em;
    }

    .k6wiz-step-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.58);
      font-size: 14px;
      line-height: 1.7;
      max-width: 720px;
    }

    .k6wiz-field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .k6wiz-field-label {
      color: rgba(255, 255, 255, 0.42);
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }

    .k6wiz-field-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr) 120px;
      gap: 12px;
    }

    .k6wiz-field-input {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.035);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
      color: ${tokens.colors.textMain};
      font-size: 13px;
      padding: 12px 14px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .k6wiz-field-input:focus {
      border-color: rgba(45, 212, 191, 0.45);
      box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.12);
      background: rgba(255, 255, 255, 0.05);
    }

    .k6wiz-preset-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .k6wiz-preset-card {
      position: relative;
      padding: 16px 14px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02));
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .k6wiz-preset-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.16);
      box-shadow: 0 14px 28px rgba(0,0,0,0.25);
    }

    .k6wiz-preset-card.is-active.accent-green {
      border-color: rgba(46, 229, 157, 0.55);
      box-shadow: 0 0 28px rgba(46, 229, 157, 0.18);
      background: linear-gradient(180deg, rgba(46,229,157,0.14), rgba(46,229,157,0.05));
    }

    .k6wiz-preset-card.is-active.accent-blue,
    .k6wiz-preset-card.is-active.accent-purple {
      border-color: rgba(34, 211, 238, 0.55);
      box-shadow: 0 0 28px rgba(34, 211, 238, 0.18);
      background: linear-gradient(180deg, rgba(34,211,238,0.14), rgba(34,211,238,0.05));
    }

    .k6wiz-preset-card.is-active.accent-teal {
      border-color: rgba(45, 212, 191, 0.55);
      box-shadow: 0 0 28px rgba(45, 212, 191, 0.18);
      background: linear-gradient(180deg, rgba(45,212,191,0.14), rgba(45,212,191,0.05));
    }

    .k6wiz-preset-card.is-active.accent-orange {
      border-color: rgba(249, 115, 22, 0.55);
      box-shadow: 0 0 28px rgba(249, 115, 22, 0.18);
      background: linear-gradient(180deg, rgba(249,115,22,0.14), rgba(249,115,22,0.05));
    }

    .k6wiz-preset-icon {
      margin-bottom: 8px;
      font-size: 24px;
    }

    .k6wiz-preset-name {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.9px;
      text-transform: uppercase;
      color: rgba(255,255,255,0.72);
    }

    .k6wiz-preset-name.is-active.accent-green { color: ${tokens.colors.accentGreen}; }
    .k6wiz-preset-name.is-active.accent-blue,
    .k6wiz-preset-name.is-active.accent-purple { color: ${tokens.colors.accentBlue}; }
    .k6wiz-preset-name.is-active.accent-teal { color: ${tokens.colors.accentTeal}; }
    .k6wiz-preset-name.is-active.accent-orange { color: ${tokens.colors.accentOrange}; }
    .k6wiz-preset-name.is-active.accent-danger { color: ${tokens.colors.accentError}; }

    .k6wiz-preset-desc {
      margin-top: 6px;
      color: rgba(255,255,255,0.38);
      font-size: 10px;
      line-height: 1.55;
    }

    .k6wiz-slider-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.025);
    }

    .k6wiz-slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .k6wiz-slider-track {
      flex: 1;
      height: 6px;
      border-radius: 999px;
      appearance: none;
      outline: none;
      cursor: pointer;
      background: linear-gradient(90deg, rgba(34,211,238,0.22), rgba(46,229,157,0.32));
    }

    .k6wiz-slider-val {
      min-width: 68px;
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 900;
    }

    .k6wiz-slider-val.accent-green { color: ${tokens.colors.accentGreen}; }
    .k6wiz-slider-val.accent-teal { color: ${tokens.colors.accentTeal}; }
    .k6wiz-slider-val.accent-blue { color: ${tokens.colors.accentBlue}; }
    .k6wiz-slider-val.accent-orange { color: ${tokens.colors.accentOrange}; }
    .k6wiz-slider-val.accent-danger { color: ${tokens.colors.accentError}; }

    .k6wiz-endpoint-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 260px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .k6wiz-endpoint-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.04);
      background: rgba(255,255,255,0.02);
      transition: all 0.18s ease;
    }

    .k6wiz-endpoint-row.is-enabled {
      opacity: 1;
      border-color: rgba(255,255,255,0.08);
    }

    .k6wiz-endpoint-row.is-disabled {
      opacity: 0.45;
    }

    .k6wiz-endpoint-row:hover {
      border-color: rgba(45,212,191,0.18);
      transform: translateX(2px);
    }

    .k6wiz-method-badge {
      min-width: 48px;
      padding: 4px 8px;
      border-radius: 8px;
      text-align: center;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.6px;
    }

    .k6wiz-method-badge.accent-green { background: rgba(46,229,157,0.12); color: ${tokens.colors.accentGreen}; }
    .k6wiz-method-badge.accent-blue { background: rgba(34,211,238,0.12); color: ${tokens.colors.accentBlue}; }
    .k6wiz-method-badge.accent-orange { background: rgba(249,115,22,0.12); color: ${tokens.colors.accentOrange}; }
    .k6wiz-method-badge.accent-purple { background: rgba(85,209,247,0.12); color: ${tokens.colors.accentPurple}; }
    .k6wiz-method-badge.accent-danger { background: rgba(239,68,68,0.12); color: ${tokens.colors.accentError}; }

    .k6wiz-endpoint-path {
      flex: 1;
      min-width: 0;
      color: rgba(255,255,255,0.78);
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .k6wiz-endpoint-action {
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.4);
      font-size: 12px;
      cursor: pointer;
      transition: color 0.18s ease, transform 0.18s ease;
    }

    .k6wiz-endpoint-action:hover {
      color: ${tokens.colors.accentError};
      transform: scale(1.08);
    }

    .k6wiz-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 30px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: linear-gradient(180deg, rgba(255,255,255,0.00), rgba(255,255,255,0.02));
    }

    .k6wiz-btn {
      border-radius: 14px;
      padding: 12px 20px;
      border: 1px solid transparent;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    }

    .k6wiz-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .k6wiz-btn:disabled {
      cursor: not-allowed;
    }

    .k6wiz-btn--solid {
      color: #071017;
      box-shadow: 0 12px 24px rgba(0,0,0,0.24);
    }

    .k6wiz-btn--solid.accent-green {
      background: linear-gradient(135deg, ${tokens.colors.accentGreen}, ${tokens.colors.accentTeal});
    }

    .k6wiz-btn--solid.accent-teal {
      background: linear-gradient(135deg, ${tokens.colors.accentTeal}, ${tokens.colors.accentBlue});
    }

    .k6wiz-btn--solid.accent-blue,
    .k6wiz-btn--solid.accent-purple {
      background: linear-gradient(135deg, ${tokens.colors.accentBlue}, ${tokens.colors.accentDeepBlue});
      color: white;
    }

    .k6wiz-btn--solid.accent-orange {
      background: linear-gradient(135deg, ${tokens.colors.accentOrange}, #fb923c);
      color: white;
    }

    .k6wiz-btn--solid.accent-danger {
      background: linear-gradient(135deg, ${tokens.colors.accentError}, #f87171);
      color: white;
    }

    .k6wiz-btn--outline {
      background: rgba(255,255,255,0.02);
      color: rgba(255,255,255,0.84);
      border-color: rgba(255,255,255,0.14);
    }

    .k6wiz-btn--outline.accent-green { color: ${tokens.colors.accentGreen}; border-color: rgba(46,229,157,0.22); }
    .k6wiz-btn--outline.accent-teal { color: ${tokens.colors.accentTeal}; border-color: rgba(45,212,191,0.22); }
    .k6wiz-btn--outline.accent-blue,
    .k6wiz-btn--outline.accent-purple { color: ${tokens.colors.accentBlue}; border-color: rgba(34,211,238,0.22); }
    .k6wiz-btn--outline.accent-orange { color: ${tokens.colors.accentOrange}; border-color: rgba(249,115,22,0.24); }
    .k6wiz-btn--outline.accent-danger { color: ${tokens.colors.accentError}; border-color: rgba(239,68,68,0.24); }

    .k6wiz-btn--ghost {
      background: rgba(255,255,255,0.03);
      color: rgba(255,255,255,0.82);
      border-color: rgba(255,255,255,0.12);
    }

    .k6wiz-close-btn {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 2;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.72);
      font-size: 11px;
      font-weight: 800;
      padding: 10px 14px;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .k6wiz-close-btn:hover {
      color: white;
      border-color: rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.07);
    }

    @media (max-width: 960px) {
      .k6wiz-panel {
        width: 100%;
        max-height: 92vh;
      }

      .k6wiz-preset-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .k6wiz-step-labels {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .k6wiz-overlay {
        padding: 10px;
      }

      .k6wiz-header,
      .k6wiz-body,
      .k6wiz-footer {
        padding-left: 18px;
        padding-right: 18px;
      }

      .k6wiz-field-row,
      .k6wiz-preset-grid {
        grid-template-columns: 1fr;
      }

      .k6wiz-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .k6wiz-step-labels {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
};
