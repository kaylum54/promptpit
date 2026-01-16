'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMemo } from 'react';

// Light theme colors matching the dashboard
const colors = {
  accent: '#111827', // gray-900
  success: '#16a34a', // green-600
  bgBase: '#fafafa',
  bgSurface: '#ffffff',
  bgElevated: '#f9fafb',
  border: '#e5e7eb', // gray-200
  borderSubtle: '#f3f4f6', // gray-100
  textPrimary: '#111827', // gray-900
  textSecondary: '#4b5563', // gray-600
  textTertiary: '#6b7280', // gray-500
  textMuted: '#9ca3af', // gray-400
};

// Types for chart data
interface UserGrowthDataPoint {
  created_at: string;
}

interface DebatesPerDayDataPoint {
  created_at: string;
}

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[] | undefined;
}

interface DebatesPerDayChartProps {
  data: DebatesPerDayDataPoint[] | undefined;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  valueLabel: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-gray-900 text-sm font-semibold">
          {payload[0].value} {valueLabel}
        </p>
      </div>
    );
  }
  return null;
};

// Chart skeleton component for loading state
export const ChartSkeleton = () => (
  <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg bg-gray-50 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-24"></div>
  </div>
);

// Helper function to process user growth data (cumulative users per day)
function processUserGrowthData(data: UserGrowthDataPoint[] | undefined) {
  if (!data || data.length === 0) return [];

  // Group by date and count cumulative users
  const dateMap = new Map<string, number>();

  // Sort by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Count users per day
  sortedData.forEach((item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  // Convert to cumulative array
  const result: Array<{ date: string; users: number }> = [];
  let cumulative = 0;

  dateMap.forEach((count, date) => {
    cumulative += count;
    result.push({ date, users: cumulative });
  });

  return result;
}

// Helper function to process debates per day data
function processDebatesPerDayData(data: DebatesPerDayDataPoint[] | undefined) {
  if (!data || data.length === 0) return [];

  // Group by date and count debates
  const dateMap = new Map<string, number>();

  data.forEach((item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  // Convert to array and sort by date
  const result = Array.from(dateMap.entries()).map(([date, debates]) => ({
    date,
    debates,
  }));

  // Sort by actual date (not string)
  return result.sort((a, b) => {
    const dateA = new Date(a.date + ', 2024');
    const dateB = new Date(b.date + ', 2024');
    return dateA.getTime() - dateB.getTime();
  });
}

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
    <svg
      className="w-12 h-12 text-gray-300 mb-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <p className="text-gray-400 text-sm">{message}</p>
  </div>
);

// User Growth Chart Component
export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = useMemo(() => processUserGrowthData(data), [data]);

  if (!data || chartData.length === 0) {
    return <EmptyState message="No user data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.borderSubtle}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.textTertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tick={{ fill: colors.textTertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <CustomTooltip
                active={active}
                payload={payload}
                label={label}
                valueLabel="total users"
              />
            )}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke={colors.accent}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: colors.accent,
              stroke: colors.bgSurface,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Debates Per Day Chart Component
export function DebatesPerDayChart({ data }: DebatesPerDayChartProps) {
  const chartData = useMemo(() => processDebatesPerDayData(data), [data]);

  if (!data || chartData.length === 0) {
    return <EmptyState message="No debate data available" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.borderSubtle}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.textTertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tick={{ fill: colors.textTertiary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <CustomTooltip
                active={active}
                payload={payload}
                label={label}
                valueLabel="debates"
              />
            )}
          />
          <Bar
            dataKey="debates"
            fill={colors.success}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
