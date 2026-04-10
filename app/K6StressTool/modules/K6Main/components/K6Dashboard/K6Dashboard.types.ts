import { ReactNode } from 'react';

export interface K6DashboardProps {
    currentReport: any;
    stats: any;
}

export interface TickerItemProps {
    label: string;
    value: ReactNode;
    icon: ReactNode;
    color?: string;
    trend?: string;
    data?: any[];
}
