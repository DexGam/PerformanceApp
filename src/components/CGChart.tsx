import { useMemo, useState, useRef } from 'react';
import type { EnvelopePoint, ComputedCondition } from '@/types';

interface Props {
  envelope: EnvelopePoint[];
  takeoff: ComputedCondition;
  landing: ComputedCondition;
}

interface PlotPoint {
  label: string;
  weight: number;
  cg: number;
  color: string;
  inLimits: boolean;
}

export function CGChart({ envelope, takeoff, landing }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { width, height, margin } = {
    width: 560,
    height: 380,
    margin: { top: 20, right: 30, bottom: 50, left: 60 },
  };

  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    const allArms = envelope.flatMap((e) => [e.forwardArm, e.aftArm]);
    const allWeights = envelope.map((e) => e.weight);
    const points = [takeoff, landing];
    const pointArms = points.map((p) => p.cg).filter((c) => c > 0);
    const pointWeights = points.map((p) => p.totalWeight).filter((w) => w > 0);

    const armMin = Math.min(...allArms, ...pointArms);
    const armMax = Math.max(...allArms, ...pointArms);
    const wMin = Math.min(...allWeights, ...pointWeights);
    const wMax = Math.max(...allWeights, ...pointWeights);

    const armPad = (armMax - armMin) * 0.15 || 5;
    const wPad = (wMax - wMin) * 0.1 || 200;

    return {
      xMin: Math.floor(armMin - armPad),
      xMax: Math.ceil(armMax + armPad),
      yMin: Math.floor(wMin - wPad),
      yMax: Math.ceil(wMax + wPad),
    };
  }, [envelope, takeoff, landing]);

  const xScale = (arm: number) =>
    margin.left + ((arm - xMin) / (xMax - xMin)) * plotW;
  const yScale = (weight: number) =>
    margin.top + plotH - ((weight - yMin) / (yMax - yMin)) * plotH;

  // Build envelope polygon points
  const { forwardPath, aftPath, polygonPath } = useMemo(() => {
    const sorted = [...envelope].sort((a, b) => a.weight - b.weight);
    const forward = sorted.map((p) => `${xScale(p.forwardArm)},${yScale(p.weight)}`);
    const aft = [...sorted]
      .reverse()
      .map((p) => `${xScale(p.aftArm)},${yScale(p.weight)}`);
    return {
      forwardPath: `M ${forward.join(' L ')}`,
      aftPath: `M ${aft.join(' L ')}`,
      polygonPath: `M ${forward.join(' L ')} L ${aft.join(' ')} Z`,
    };
  }, [envelope, xMin, xMax, yMin, yMax]);

  const plotPoints: PlotPoint[] = [
    {
      label: 'Takeoff',
      weight: takeoff.totalWeight,
      cg: takeoff.cg,
      color: '#0ea5e9',
      inLimits: takeoff.withinEnvelope,
    },
    {
      label: 'Landing',
      weight: landing.totalWeight,
      cg: landing.cg,
      color: '#f59e0b',
      inLimits: landing.withinEnvelope,
    },
  ].filter((p) => p.weight > 0 && p.cg > 0);

  // Grid lines
  const xTicks = useMemo(() => {
    const step = niceStep(xMax - xMin);
    const ticks: number[] = [];
    for (let v = Math.ceil(xMin / step) * step; v <= xMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [xMin, xMax]);

  const yTicks = useMemo(() => {
    const step = niceStep(yMax - yMin);
    const ticks: number[] = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
      ticks.push(v);
    }
    return ticks;
  }, [yMin, yMax]);

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxWidth: '100%' }}
      >
        {/* Background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={plotW}
          height={plotH}
          className="fill-white dark:fill-slate-900"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.15"
        />

        {/* Grid lines */}
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line
              x1={xScale(tick)}
              y1={margin.top}
              x2={xScale(tick)}
              y2={margin.top + plotH}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1"
            />
            <text
              x={xScale(tick)}
              y={margin.top + plotH + 18}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={margin.left}
              y1={yScale(tick)}
              x2={margin.left + plotW}
              y2={yScale(tick)}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1"
            />
            <text
              x={margin.left - 8}
              y={yScale(tick) + 4}
              textAnchor="end"
              className="fill-slate-500 text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Axis labels */}
        <text
          x={margin.left + plotW / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
        >
          CG Arm (inches from datum)
        </text>
        <text
          x={14}
          y={margin.top + plotH / 2}
          textAnchor="middle"
          className="fill-slate-600 dark:fill-slate-300 text-xs font-medium"
          transform={`rotate(-90 14 ${margin.top + plotH / 2})`}
        >
          Weight (lb)
        </text>

        {/* Envelope polygon */}
        <path
          d={polygonPath}
          className="fill-emerald-400/15 stroke-emerald-500"
          strokeWidth="2"
        />
        <path d={forwardPath} className="stroke-emerald-500" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        <path d={aftPath} className="stroke-emerald-500" strokeWidth="2" fill="none" strokeDasharray="4 3" />

        {/* Plot points */}
        {plotPoints.map((p) => {
          const cx = xScale(p.cg);
          const cy = yScale(p.weight);
          const isHover = hover === p.label;
          const r = isHover ? 7 : 5;
          return (
            <g
              key={p.label}
              onMouseEnter={() => setHover(p.label)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              {isHover && (
                <circle cx={cx} cy={cy} r="14" fill={p.color} fillOpacity="0.15" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={p.color}
                stroke="white"
                strokeWidth="2"
                className="drop-shadow-md"
              />
              {p.inLimits ? (
                <circle cx={cx} cy={cy} r="2" fill="white" />
              ) : (
                <path
                  d={`M ${cx - 2.5} ${cy - 2.5} L ${cx + 2.5} ${cy + 2.5} M ${cx + 2.5} ${cy - 2.5} L ${cx - 2.5} ${cy + 2.5}`}
                  stroke="white"
                  strokeWidth="1.5"
                />
              )}
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                className="fill-slate-700 dark:fill-slate-200 text-[10px] font-semibold"
              >
                {p.label}
              </text>
              {isHover && (
                <g>
                  <rect
                    x={cx + 12}
                    y={cy - 28}
                    width="120"
                    height="36"
                    rx="6"
                    className="fill-slate-800 dark:fill-slate-700"
                  />
                  <text
                    x={cx + 18}
                    y={cy - 15}
                    className="fill-white text-[10px] font-semibold"
                  >
                    {p.label}
                  </text>
                  <text
                    x={cx + 18}
                    y={cy - 2}
                    className="fill-slate-300 text-[10px] tabular-nums"
                  >
                    {p.weight.toFixed(0)} lb · {p.cg.toFixed(1)} in
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3 text-xs">
        <LegendItem color="#0ea5e9" label="Takeoff" />
        <LegendItem color="#f59e0b" label="Landing" />
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded-sm bg-emerald-400/15 border border-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300">CG Envelope</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-full border-2 border-white"
        style={{ backgroundColor: color }}
      />
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
}

function niceStep(range: number): number {
  const raw = range / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step: number;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}
