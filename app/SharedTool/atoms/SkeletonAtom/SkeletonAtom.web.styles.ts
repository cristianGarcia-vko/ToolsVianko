import { CSSProperties } from 'react';

export const getSkeletonStyle = (
    width: string | number,
    height: string | number,
    radius: string | number,
    extra?: CSSProperties
): CSSProperties => ({
    width,
    height,
    borderRadius: radius,
    background: 'white',
    ...extra,
});
