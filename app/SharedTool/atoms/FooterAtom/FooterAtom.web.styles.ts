import { CSSProperties } from 'react';
import { tokens } from '../../style/tokens.shared.style';

export const footerStyles = {
    copyright: {
        position: 'absolute',
        bottom: '40px',
        color: tokens.colors.textCopyright,
        fontSize: '11px',
        letterSpacing: '2px',
        fontWeight: 700,
        textTransform: 'uppercase',
        textAlign: 'center',
        width: '100%',
        pointerEvents: 'none',
    } as CSSProperties,
};
