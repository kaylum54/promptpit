'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface ProToolLayoutProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor: 'red' | 'purple' | 'amber' | 'green';
  progress?: number; // 0-100
  projectName?: string;
  children: ReactNode;
}

const colorConfig = {
  red: {
    gradient: 'from-red-600 via-red-500 to-orange-500',
    glow: 'bg-red-500/20',
    ring: 'text-red-500',
    badge: 'bg-red-500/10 text-red-700 border-red-200',
    icon: 'text-red-100',
  },
  purple: {
    gradient: 'from-purple-600 via-purple-500 to-indigo-500',
    glow: 'bg-purple-500/20',
    ring: 'text-purple-500',
    badge: 'bg-purple-500/10 text-purple-700 border-purple-200',
    icon: 'text-purple-100',
  },
  amber: {
    gradient: 'from-amber-600 via-amber-500 to-yellow-500',
    glow: 'bg-amber-500/20',
    ring: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 border-amber-200',
    icon: 'text-amber-100',
  },
  green: {
    gradient: 'from-green-600 via-green-500 to-emerald-500',
    glow: 'bg-green-500/20',
    ring: 'text-green-500',
    badge: 'bg-green-500/10 text-green-700 border-green-200',
    icon: 'text-green-100',
  },
};

export function ProToolLayout({
  title,
  subtitle,
  icon,
  accentColor,
  progress = 0,
  projectName,
  children,
}: ProToolLayoutProps) {
  const colors = colorConfig[accentColor];

  // Calculate progress ring values
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${colors.gradient}`}>
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className={`absolute -top-24 -right-24 w-96 h-96 ${colors.glow} rounded-full blur-3xl`} />
          <div className={`absolute -bottom-24 -left-24 w-72 h-72 ${colors.glow} rounded-full blur-3xl`} />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            {/* Left: Title and breadcrumb */}
            <div className="flex items-start gap-5">
              {/* Icon container */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <div className={colors.icon}>
                  {icon}
                </div>
              </div>

              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link href="/dashboard/tools" className="hover:text-white transition-colors">
                    Pro Tools
                  </Link>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-white">{title}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                <p className="text-white/80">{subtitle}</p>
              </div>
            </div>

            {/* Right: Progress and Project */}
            <div className="flex items-center gap-6">
              {/* Project selector */}
              {projectName && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Active Project</p>
                  <p className="text-white font-medium">{projectName}</p>
                </div>
              )}

              {/* Progress ring */}
              {progress > 0 && (
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="18"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="18"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{progress}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}

// Reusable card component for tool content
export function ToolCard({
  title,
  description,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// Checklist item component
interface ChecklistItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export function ChecklistItem({
  id,
  label,
  description,
  checked,
  onChange,
  severity,
}: ChecklistItemProps) {
  const severityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <label
      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        checked
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex-shrink-0 pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(id, e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
            checked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 bg-white'
          }`}
        >
          {checked && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${checked ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {label}
          </span>
          {severity && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityColors[severity]}`}>
              {severity}
            </span>
          )}
        </div>
        {description && (
          <p className={`text-sm mt-1 ${checked ? 'text-green-600' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

// Stats display component
export function ToolStats({
  stats,
}: {
  stats: Array<{ label: string; value: string | number; icon?: ReactNode }>;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-4 text-center"
        >
          {stat.icon && (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-2">
              {stat.icon}
            </div>
          )}
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
