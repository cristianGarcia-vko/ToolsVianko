import { CSSProperties } from 'react';
import { tokens, ThemeTokens } from '../../../SharedTool/style/tokens.shared.style';

export const createK6Styles = (theme: ThemeTokens) => {
    const baseInput = {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '8px 12px',
        color: 'white',
        fontSize: '12px',
        outline: 'none',
        width: '100%',
        margin: '4px 0',
    } as CSSProperties;

    return {
        noScrollbar: {
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
        } as CSSProperties,

        container: {
            width: '100%',
            height: '100vh',
            background: '#0b0d13',
            color: 'white',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            padding: '12px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
            boxSizing: 'border-box' as const,
            overflowY: 'auto' as const,
            overflowX: 'hidden' as const,
        } as CSSProperties,

        tickerRow: {
            display: 'flex',
            gap: '20px',
            overflowX: 'auto' as const,
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
        } as CSSProperties,

        tickerItem: {
            display: 'flex',
            flexDirection: 'column' as const,
            minWidth: '120px',
            gap: '2px',
        } as CSSProperties,

        dashboardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '12px',
            flex: 1,
            overflow: 'hidden',
        } as CSSProperties,

        // KPI Cards: The small boxes with sparklines or values
        kpiCard: (accent: string) => ({
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            position: 'relative' as const,
            overflow: 'hidden',
            minHeight: '80px',
        }) as CSSProperties,

        kpiValue: {
            fontSize: '22px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.5px',
        } as CSSProperties,

        // Main Chart: The big section
        mainPanel: {
            gridColumn: 'span 8',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
            overflowY: 'auto' as const,
            maxHeight: 'calc(100vh - 100px)',
            paddingRight: '6px',
        } as CSSProperties,

        // Sidebar: Right section with donut and orchestrator
        sidePanel: {
            gridColumn: 'span 4',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
            overflowY: 'auto' as const,
            maxHeight: 'calc(100vh - 100px)',
            paddingRight: '6px',
        } as CSSProperties,

        toolGroup: (accent: string, background: string) => ({
            background,
            border: `1px solid ${accent}`,
            borderRadius: '28px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }) as CSSProperties,

        toolGroupHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
        } as CSSProperties,

        toolGroupEyebrow: (color: string) => ({
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            color,
            marginBottom: '8px',
        }) as CSSProperties,

        toolGroupTitle: {
            margin: 0,
            fontSize: '20px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.4px',
        } as CSSProperties,

        toolGroupText: {
            margin: '8px 0 0 0',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.66)',
        } as CSSProperties,

        toolGroupStack: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
        } as CSSProperties,

        moduleCard: (accent: string) => ({
            background: 'rgba(7, 9, 16, 0.4)',
            border: `1px solid ${accent}2e`,
            borderRadius: '22px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '12px',
        }) as CSSProperties,

        moduleCardHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
        } as CSSProperties,

        moduleCardTitle: {
            margin: 0,
            fontSize: '15px',
            fontWeight: 800,
            color: 'white',
        } as CSSProperties,

        moduleCardDescription: {
            margin: '6px 0 0 0',
            fontSize: '11px',
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.58)',
            maxWidth: '720px',
        } as CSSProperties,

        moduleHelpButton: (accent: string) => ({
            border: `1px solid ${accent}40`,
            background: `${accent}14`,
            color: accent,
            borderRadius: '999px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            whiteSpace: 'nowrap' as const,
        }) as CSSProperties,

        glassCard: {
            background: 'rgba(17, 19, 26, 0.6)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '24px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column' as const,
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
            position: 'relative' as const,
        } as CSSProperties,

        chartTitle: {
            fontSize: '11px',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        } as CSSProperties,

        chartContainer: {
            width: '100%',
            height: '240px',
            position: 'relative',
            minHeight: '240px',
        } as CSSProperties,

        // Specific Trading-style components
        donutWrapper: {
            width: '180px',
            height: '180px',
            position: 'relative' as const,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        } as CSSProperties,

        donutCenter: {
            position: 'absolute' as const,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            textAlign: 'center' as const,
        } as CSSProperties,

        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '11px',
        } as CSSProperties,

        th: {
            textAlign: 'left' as const,
            color: 'rgba(255,255,255,0.2)',
            fontWeight: 900,
            padding: '8px 4px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        } as CSSProperties,

        td: {
            padding: '10px 4px',
            color: 'rgba(255,255,255,0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
        } as CSSProperties,

        // Orchestrator Area
        orchestratorBox: {
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.03)',
        } as CSSProperties,

        input: baseInput,

        button: (color: string) => ({
            background: color,
            border: 'none',
            borderRadius: '12px',
            padding: '10px',
            color: '#000',
            fontWeight: 900,
            fontSize: '11px',
            cursor: 'pointer',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginTop: '10px',
            transition: 'opacity 0.2s',
        }) as CSSProperties,

        terminal: {
            background: '#090a0f',
            borderRadius: '16px',
            padding: '12px',
            fontSize: '10px',
            overflowY: 'auto' as const,
            maxHeight: '120px',
            fontFamily: "'JetBrains Mono', monospace",
            border: '1px solid rgba(255,255,255,0.03)',
        } as CSSProperties,
        sectionHeader: {
            gridColumn: 'span 12',
            fontSize: '10px',
            fontWeight: 900,
            color: theme.colors.accentTeal,
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            marginTop: '20px',
            paddingLeft: '4px',
            borderLeft: `2px solid ${theme.colors.accentTeal}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        } as CSSProperties,

        statusBadge: (color: string) => ({
            padding: '2px 8px',
            borderRadius: '4px',
            background: `${color}11`,
            color: color,
            fontSize: '9px',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
        }) as CSSProperties,

        insightCard: {
            background: 'rgba(255,255,50,0.05)',
            border: '1px solid rgba(255,255,50,0.1)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '8px',
        } as CSSProperties,

        dashboardLayout: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
        } as CSSProperties,

        errorAnalysisGrid: {
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 300px) 1fr',
            gap: '12px'
        } as CSSProperties,

        httpCodesCard: {
            width: '100%',
            height: '140px',
            position: 'relative',
            minHeight: '140px',
        } as CSSProperties,

        responsiveScrollContainer: {
            maxHeight: '200px',
            overflowY: 'auto' as const,
        } as CSSProperties,

        endpointFoundRow: {
            color: theme.colors.accentTeal,
            marginBottom: '4px',
            fontSize: '10px'
        } as CSSProperties,

        insightHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        } as CSSProperties,

        insightDot: {
            background: '#FFD700',
            borderRadius: '50%',
            width: '8px',
            height: '8px'
        } as CSSProperties,

        insightTitle: {
            fontSize: '12px',
            fontWeight: 900,
            color: '#FFD700'
        } as CSSProperties,

        insightText: {
            fontSize: '11px',
            lineHeight: '1.6',
            opacity: 0.8,
            color: 'white'
        } as CSSProperties,

        orchestratorStack: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '8px'
        } as CSSProperties,

        orchestratorFormRow: (loading: boolean) => ({
            display: 'grid',
            gridTemplateColumns: '80px 1fr 60px',
            gap: '8px',
            opacity: loading ? 0.5 : 1
        }) as CSSProperties,

        inputLabel: {
            fontSize: '9px',
            opacity: 0.4,
            fontWeight: 900
        } as CSSProperties,

        inputSectionOpacity: (loading: boolean) => ({
            opacity: loading ? 0.5 : 1
        }) as CSSProperties,

        vusDurationGrid: {
            display: 'grid',
            gridTemplateColumns: 'minmax(60px, 1fr) minmax(60px, 1fr)',
            gap: '10px'
        } as CSSProperties,

        actionButtonRow: {
            display: 'flex',
            gap: '8px'
        } as CSSProperties,

        statusMessageBanner: {
            padding: '8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            fontSize: '10px',
            color: theme.colors.accentTeal,
            textAlign: 'center' as const,
            fontWeight: 900
        } as CSSProperties,

        zipDiscoveryBox: {
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '8px'
        } as CSSProperties,

        zipDiscoveryLabel: {
            fontSize: '10px',
            color: theme.colors.accentGreen,
            margin: '6px 0',
            fontWeight: 900
        } as CSSProperties,

        zipActionRow: {
            display: 'flex',
            gap: '8px',
            marginTop: '8px'
        } as CSSProperties,

        discoveryCard: {
            background: 'linear-gradient(180deg, rgba(8, 29, 34, 0.95) 0%, rgba(10, 18, 24, 0.88) 100%)',
            border: `1px solid ${theme.colors.accentTeal}33`,
            borderRadius: '24px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
        } as CSSProperties,

        discoveryHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap' as const,
        } as CSSProperties,

        discoveryEyebrow: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: theme.colors.accentTeal,
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '1.4px',
            textTransform: 'uppercase' as const,
            marginBottom: '10px',
        } as CSSProperties,

        discoveryTitle: {
            margin: 0,
            fontSize: '22px',
            fontWeight: 800,
            color: 'white',
        } as CSSProperties,

        discoverySubtitle: {
            margin: '8px 0 0 0',
            fontSize: '12px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.68)',
            maxWidth: '680px',
        } as CSSProperties,

        discoveryBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '999px',
            background: `${theme.colors.accentTeal}1c`,
            color: theme.colors.accentTeal,
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase' as const,
            border: `1px solid ${theme.colors.accentTeal}33`,
        } as CSSProperties,

        discoveryGrid: {
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 0.9fr) minmax(300px, 1.1fr)',
            gap: '16px',
        } as CSSProperties,

        discoveryUploadBox: {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '16px',
        } as CSSProperties,

        discoveryConsumerBox: {
            background: 'rgba(255,255,255,0.025)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '14px',
        } as CSSProperties,

        discoveryConsumerHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap' as const,
        } as CSSProperties,

        discoveryCount: {
            fontSize: '10px',
            color: theme.colors.accentGreen,
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
        } as CSSProperties,

        discoveryPillRow: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap' as const,
        } as CSSProperties,

        discoveryPill: (color: string) => ({
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: '999px',
            background: `${color}14`,
            color,
            border: `1px solid ${color}33`,
            fontSize: '10px',
            fontWeight: 800,
        }) as CSSProperties,

        discoveryTerminal: {
            background: '#070b11',
            borderRadius: '16px',
            padding: '12px',
            minHeight: '132px',
            maxHeight: '220px',
            overflowY: 'auto' as const,
            border: '1px solid rgba(255,255,255,0.04)',
            fontFamily: "'JetBrains Mono', monospace",
        } as CSSProperties,

        discoveryEmptyState: {
            minHeight: '108px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            textAlign: 'center' as const,
            color: 'rgba(255,255,255,0.45)',
            fontSize: '11px',
            lineHeight: 1.6,
        } as CSSProperties,

        guideOverlay: {
            position: 'fixed' as const,
            inset: 0,
            background: 'rgba(4, 7, 12, 0.72)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 9999,
        } as CSSProperties,

        guideModal: {
            width: 'min(920px, 100%)',
            maxHeight: '88vh',
            overflowY: 'auto' as const,
            background: 'linear-gradient(180deg, rgba(12, 15, 24, 0.98) 0%, rgba(8, 10, 17, 0.98) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '28px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            padding: '22px',
        } as CSSProperties,

        guideHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '18px',
        } as CSSProperties,

        guideBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 10px',
            borderRadius: '999px',
            background: `${theme.colors.accentBlue}1c`,
            color: theme.colors.accentBlue,
            border: `1px solid ${theme.colors.accentBlue}33`,
            fontSize: '10px',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginBottom: '12px',
        } as CSSProperties,

        guideTitle: {
            margin: 0,
            fontSize: '26px',
            fontWeight: 800,
            color: 'white',
        } as CSSProperties,

        guideSummary: {
            margin: '10px 0 0 0',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '760px',
        } as CSSProperties,

        guideCloseButton: {
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        } as CSSProperties,

        guideContent: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '14px',
        } as CSSProperties,

        guideSection: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '16px',
        } as CSSProperties,

        guideSectionTitle: {
            margin: 0,
            fontSize: '13px',
            fontWeight: 800,
            color: theme.colors.accentTeal,
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
        } as CSSProperties,

        guideBulletList: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '10px',
            marginTop: '12px',
        } as CSSProperties,

        guideBulletItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
        } as CSSProperties,

        guideBulletDot: {
            width: '8px',
            height: '8px',
            borderRadius: '999px',
            background: theme.colors.accentGreen,
            marginTop: '6px',
            flexShrink: 0,
        } as CSSProperties,

        guideExample: {
            margin: '12px 0 0 0',
            background: '#070b11',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '14px',
            fontSize: '11px',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.86)',
            whiteSpace: 'pre-wrap' as const,
            wordBreak: 'break-word' as const,
            fontFamily: "'JetBrains Mono', monospace",
        } as CSSProperties,

        guideNote: {
            padding: '14px 16px',
            borderRadius: '16px',
            background: `${theme.colors.accentOrange}14`,
            border: `1px solid ${theme.colors.accentOrange}2d`,
            color: 'rgba(255,255,255,0.86)',
            fontSize: '12px',
            lineHeight: 1.6,
        } as CSSProperties,

        planConfigBox: {
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginTop: '8px'
        } as CSSProperties,

        planConfigHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
        } as CSSProperties,

        planJsonArea: (loading: boolean) => ({
            ...baseInput,
            minHeight: '120px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            resize: 'vertical' as const,
            background: 'rgba(0,0,0,0.2)',
            opacity: loading ? 0.5 : 1
        }) as CSSProperties,

        historyLineItem: (hasFailed: boolean) => ({
            marginBottom: '8px',
            borderLeft: `2px solid ${hasFailed ? theme.colors.accentError : theme.colors.accentGreen}`,
            paddingLeft: '8px'
        }) as CSSProperties,

        tickerLabelGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '9px',
            fontWeight: 900,
            opacity: 0.4
        } as CSSProperties,

        tickerValueGroup: {
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px'
        } as CSSProperties,

        tickerSparkline: {
            height: '24px',
            width: '100%',
            opacity: 0.3,
            position: 'relative',
            minHeight: '24px',
        } as CSSProperties,
    };
};

export const k6Styles = createK6Styles(tokens);
