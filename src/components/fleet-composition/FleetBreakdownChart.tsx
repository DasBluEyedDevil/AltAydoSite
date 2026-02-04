'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CategoryCount } from '@/hooks/useOrgFleet';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** MobiGlas-themed color palette for chart segments */
const COLORS = [
  '#4A90D9',
  '#50C878',
  '#FFB347',
  '#FF6B6B',
  '#A78BFA',
  '#F472B6',
  '#34D399',
  '#FBBF24',
  '#60A5FA',
  '#C084FC',
];

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------

interface TooltipPayload {
  name: string;
  value: number;
  payload: { name: string; count: number; percent?: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  return (
    <div
      className="border border-[rgba(var(--mg-primary),0.4)] px-3 py-2 text-sm"
      style={{ backgroundColor: 'rgba(var(--mg-panel-dark), 0.95)' }}
    >
      <p className="mg-text font-medium">{entry.payload.name}</p>
      <p className="mg-text opacity-80">
        Count: <span className="text-[rgba(var(--mg-primary),1)]">{entry.payload.count}</span>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom pie label
// ---------------------------------------------------------------------------

function renderCustomizedLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
    name = '',
  } = props;

  // Only label slices > 5%
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="rgba(var(--mg-text), 0.9)"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

// ---------------------------------------------------------------------------
// Custom legend
// ---------------------------------------------------------------------------

interface LegendEntry {
  value: string;
  color?: string;
}

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs mg-text opacity-80">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface FleetBreakdownChartProps {
  data: CategoryCount[];
  title: string;
}

export function FleetBreakdownChart({ data, title }: FleetBreakdownChartProps) {
  // Prepare data for charts (recharts needs plain objects)
  const chartData = data.map((d) => ({
    name: d.name,
    count: d.count,
  }));

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      {/* Section title */}
      <h3 className="mg-title text-lg font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)] mb-4">
        {title}
      </h3>

      {/* Charts container: stacked on mobile, side by side on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] p-4 rounded-sm">
          <p className="mg-text text-xs uppercase tracking-wider opacity-60 mb-2">Distribution</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
          {total > 0 && (
            <p className="mg-text text-xs text-center opacity-50 mt-1">
              Total: {total} ships
            </p>
          )}
        </div>

        {/* Bar Chart (horizontal bars for readability) */}
        <div className="bg-[rgba(var(--mg-panel-dark),0.4)] border border-[rgba(var(--mg-primary),0.15)] p-4 rounded-sm">
          <p className="mg-text text-xs uppercase tracking-wider opacity-60 mb-2">Counts</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis
                type="number"
                tick={{ fill: 'rgba(var(--mg-text), 0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(var(--mg-primary), 0.2)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: 'rgba(var(--mg-text), 0.8)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(var(--mg-primary), 0.2)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--mg-primary), 0.1)' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
