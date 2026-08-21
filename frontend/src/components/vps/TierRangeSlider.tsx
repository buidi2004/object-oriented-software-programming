'use client';

import React, { useMemo } from 'react';

type Accent = 'blue' | 'indigo' | 'cyan';

const ACCENT_VARS: Record<Accent, string> = {
  blue: '#8c5a3d',
  indigo: '#8c5a3d',
  cyan: '#8c5a3d',
};

function resolveTierIndex(tiers: readonly number[], value: number): number {
  const exact = tiers.indexOf(value);
  if (exact >= 0) return exact;

  let closest = 0;
  let minDiff = Math.abs(tiers[0] - value);
  tiers.forEach((tier, index) => {
    const diff = Math.abs(tier - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = index;
    }
  });
  return closest;
}

interface TierRangeSliderProps {
  tiers: readonly number[];
  value: number;
  onChange: (value: number) => void;
  accent?: Accent;
  formatMark?: (value: number) => string;
}

export function TierRangeSlider({
  tiers,
  value,
  onChange,
  accent = 'blue',
  formatMark = (v) => String(v),
}: TierRangeSliderProps) {
  const index = useMemo(() => resolveTierIndex(tiers, value), [tiers, value]);
  const maxIndex = Math.max(tiers.length - 1, 1);
  const fillPercent = (index / maxIndex) * 100;
  const accentColor = ACCENT_VARS[accent];

  const markIndices = useMemo(() => {
    if (tiers.length <= 4) {
      return tiers.map((_, i) => i);
    }
    const picks = new Set<number>([0, maxIndex]);
    const mid = Math.floor(maxIndex / 2);
    picks.add(mid);
    if (maxIndex >= 3) picks.add(Math.floor(maxIndex * 0.33));
    return [...picks].sort((a, b) => a - b);
  }, [tiers.length, maxIndex]);

  return (
    <div className="space-y-1">
      <input
        type="range"
        min={0}
        max={maxIndex}
        step={1}
        value={index}
        onChange={(e) => onChange(tiers[Number(e.target.value)])}
        className="vps-tier-range w-full"
        style={{
          ['--vps-range-accent' as string]: accentColor,
          ['--vps-range-fill' as string]: `${fillPercent}%`,
        }}
        aria-valuemin={tiers[0]}
        aria-valuemax={tiers[tiers.length - 1]}
        aria-valuenow={tiers[index]}
        aria-valuetext={formatMark(tiers[index])}
      />
      <div className="relative h-4">
        {markIndices.map((markIndex) => {
          const left = maxIndex === 0 ? 0 : (markIndex / maxIndex) * 100;
          return (
            <span
              key={markIndex}
              className="absolute text-[11px] font-semibold text-slate-600 -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${left}%` }}
            >
              {formatMark(tiers[markIndex])}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export const VPS_CPU_TIERS = [1, 2, 4, 8, 16, 32] as const;
export const VPS_RAM_TIERS = [2, 4, 8, 16, 32, 64, 128] as const;
export const VPS_DISK_TIERS = [30, 50, 80, 120, 250, 500, 1000] as const;
