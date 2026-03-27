import React from 'react';
import { tokens } from '../../style/tokens.shared.style';
import {
    getGlassCardStyle,
    getGlassButtonStyle,
    getGlassIconButtonStyle
} from './GlassAtoms.web.styles';

interface GlassCardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    intensity?: 'light' | 'medium' | 'strong';
    borderRadius?: string;
    onClick?: () => void;
}

export const GlassCardAtom: React.FC<GlassCardProps> = ({ 
    children, 
    style, 
    intensity = 'medium',
    borderRadius = '32px',
    onClick
}) => (
    <div 
        style={getGlassCardStyle(intensity, borderRadius, !!onClick, style)} 
        onClick={onClick}
    >
        {children}
    </div>
);

interface GlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    color?: string;
    style?: React.CSSProperties;
    active?: boolean;
}

export const GlassButtonAtom: React.FC<GlassButtonProps> = ({ 
    children, 
    onClick, 
    icon, 
    color = tokens.colors.accentPurple,
    style,
    active = false
}) => (
    <button 
        style={getGlassButtonStyle(active, color, style)} 
        onClick={onClick}
    >
        {icon}
        {children}
    </button>
);

export const GlassIconButtonAtom: React.FC<{
    icon: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    color?: string;
    style?: React.CSSProperties;
    tooltip?: string;
}> = ({ icon, onClick, active, color = tokens.colors.accentPurple, style, tooltip }) => (
    <button 
        title={tooltip}
        onClick={onClick}
        style={getGlassIconButtonStyle(!!active, color, style)}
    >
        {icon}
    </button>
);
