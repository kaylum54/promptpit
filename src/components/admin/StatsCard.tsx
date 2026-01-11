'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'primary' | 'success' | 'warning' | 'error';
}

const accentColorMap = {
  primary: {
    text: 'text-accent-primary',
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    border: 'border-accent-primary/20',
    topBorder: 'border-t-accent-primary/40',
  },
  success: {
    text: 'text-success',
    glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    border: 'border-success/20',
    topBorder: 'border-t-success/40',
  },
  warning: {
    text: 'text-warning',
    glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    border: 'border-warning/20',
    topBorder: 'border-t-warning/40',
  },
  error: {
    text: 'text-error',
    glow: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    border: 'border-error/20',
    topBorder: 'border-t-error/40',
  },
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  accentColor = 'primary',
}: StatsCardProps) {
  const colors = accentColorMap[accentColor];

  return (
    <div
      className={`
        bg-bg-elevated border border-border-subtle rounded-xl p-6
        border-t-2 ${colors.topBorder}
        hover:border-border-strong hover:bg-bg-subtle
        ${colors.glow}
        transition-all duration-300 ease-out
        group
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-text-tertiary text-sm font-medium uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <div className={`${colors.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
            {icon}
          </div>
        )}
      </div>

      <p className={`text-4xl font-bold font-mono text-text-primary mb-2 ${colors.text} tracking-tight`}>
        {value}
      </p>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-text-muted text-xs">vs last period</span>
        </div>
      )}
    </div>
  );
}
