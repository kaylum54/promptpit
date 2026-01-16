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
    text: 'text-gray-900',
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
    border: 'border-gray-200',
    topBorder: 'border-t-gray-900',
  },
  success: {
    text: 'text-green-600',
    iconBg: 'bg-green-50',
    iconText: 'text-green-600',
    border: 'border-green-100',
    topBorder: 'border-t-green-500',
  },
  warning: {
    text: 'text-amber-600',
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    border: 'border-amber-100',
    topBorder: 'border-t-amber-500',
  },
  error: {
    text: 'text-red-600',
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    border: 'border-red-100',
    topBorder: 'border-t-red-500',
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
        bg-white border border-gray-200 rounded-xl p-6
        border-t-2 ${colors.topBorder}
        hover:border-gray-300 hover:shadow-sm
        transition-all duration-200 ease-out
        group
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {label}
        </p>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconText} opacity-80 group-hover:opacity-100 transition-opacity`}>
            {icon}
          </div>
        )}
      </div>

      <p className={`text-3xl font-bold font-mono text-gray-900 mb-2 tracking-tight`}>
        {value}
      </p>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-400 text-xs">vs last period</span>
        </div>
      )}
    </div>
  );
}
