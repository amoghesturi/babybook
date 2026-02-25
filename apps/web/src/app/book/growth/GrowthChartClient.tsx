'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { GrowthDataPoint } from '@babybook/shared';

interface Props {
  dataPoints: GrowthDataPoint[];
}

type Metric = 'weight' | 'height' | 'head';

const METRICS: { id: Metric; label: string; unit: string; color: string; dataKey: keyof GrowthDataPoint }[] = [
  { id: 'weight', label: 'Weight', unit: 'kg',  color: 'var(--color-primary)',   dataKey: 'weight_kg' },
  { id: 'height', label: 'Height', unit: 'cm',  color: 'var(--color-secondary)', dataKey: 'height_cm' },
  { id: 'head',   label: 'Head',   unit: 'cm',  color: '#10b981',                dataKey: 'head_circumference_cm' },
];

function ageLabel(months: number) {
  if (months === 0) return 'Birth';
  if (months < 24) return `${months}m`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem === 0 ? `${years}y` : `${years}y${rem}m`;
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function CustomTooltip({
  active, payload, activeMetric,
}: {
  active?: boolean;
  payload?: { payload: GrowthDataPoint }[];
  activeMetric: Metric;
}) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  const meta = METRICS.find((m) => m.id === activeMetric)!;
  const value = pt[meta.dataKey] as number | undefined;

  return (
    <div
      className="rounded-xl shadow-lg px-4 py-3 text-sm"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {ageLabel(pt.age_months)}
      </p>
      <p style={{ color: 'var(--color-text-secondary)' }}>{formatDate(pt.date)}</p>
      {value != null && (
        <p className="mt-1 font-bold" style={{ color: meta.color }}>
          {value.toFixed(2)} {meta.unit}
        </p>
      )}
      <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
        {pt.source === 'birth_story' ? 'Birth story' : 'Monthly summary'}
      </p>
    </div>
  );
}

export function GrowthChartClient({ dataPoints }: Props) {
  const [activeMetric, setActiveMetric] = useState<Metric>('weight');
  const router = useRouter();

  const meta = METRICS.find((m) => m.id === activeMetric)!;

  // Filter to points that have this metric
  const chartData = dataPoints.filter((pt) => (pt[meta.dataKey] as number | undefined) != null);

  return (
    <div className="space-y-6">
      {/* Metric tabs */}
      <div className="flex gap-2 flex-wrap">
        {METRICS.map((m) => {
          const hasData = dataPoints.some((pt) => (pt[m.dataKey] as number | undefined) != null);
          return (
            <button
              key={m.id}
              onClick={() => setActiveMetric(m.id)}
              disabled={!hasData}
              className="px-4 py-2 rounded-full text-sm font-medium border transition disabled:opacity-40"
              style={{
                borderColor: activeMetric === m.id ? m.color : 'var(--color-border)',
                background: activeMetric === m.id ? `${m.color}15` : undefined,
                color: activeMetric === m.id ? m.color : 'var(--color-text-secondary)',
              }}
            >
              {m.label} ({m.unit})
            </button>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length < 2 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border text-center gap-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <div className="text-4xl">📊</div>
          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Not enough data yet
          </p>
          <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Add a birth story and at least one monthly summary with {meta.label.toLowerCase()} measurements to see the chart.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        >
          <h2
            className="font-display font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {meta.label} over time
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              onClick={(e) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pt = (e as any)?.activePayload?.[0]?.payload as GrowthDataPoint | undefined;
                if (pt) router.push(`/book/${pt.page_id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                opacity={0.6}
              />
              <XAxis
                dataKey="age_months"
                tickFormatter={ageLabel}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => v.toFixed(1)}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip activeMetric={activeMetric} />}
                cursor={{ stroke: meta.color, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey={meta.dataKey as string}
                stroke={meta.color}
                strokeWidth={2.5}
                dot={{ r: 5, fill: meta.color, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: meta.color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Tap a point to open that page
          </p>
        </div>
      )}

      {/* Data table */}
      {chartData.length > 0 && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Age</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Date</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: meta.color }}>{meta.label} ({meta.unit})</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((pt, i) => (
                <tr
                  key={pt.page_id}
                  className="cursor-pointer hover:bg-border/20 transition"
                  style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : undefined }}
                  onClick={() => router.push(`/book/${pt.page_id}`)}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {ageLabel(pt.age_months)}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {formatDate(pt.date)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold" style={{ color: meta.color }}>
                    {(pt[meta.dataKey] as number).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
