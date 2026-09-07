import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { Aircraft, ComputedResult, ComputedCondition } from '@/types';
import { fmt, fmtInt } from '@/lib/format';

interface Props {
  aircraft: Aircraft;
  result: ComputedResult;
}

export function ResultsPanel({ aircraft, result }: Props) {
  const { takeoff, landing } = result;
  const allPass = takeoff.withinEnvelope && landing.withinEnvelope;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div
        className={`rounded-xl p-4 border-2 transition-colors ${allPass ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500'}`}
      >
        <div className="flex items-center gap-3">
          {allPass ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-red-500 shrink-0" />
          )}
          <div>
            <p
              className={`text-lg font-bold ${allPass ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}
            >
              {allPass ? 'WITHIN LIMITS' : 'OUT OF LIMITS'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {allPass
                ? 'Both takeoff and landing conditions are within the CG envelope and weight limits.'
                : 'One or more conditions exceed weight or CG limits. Adjust loading before flight.'}
            </p>
          </div>
        </div>
      </div>

      {/* Condition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ConditionCard
          label="Takeoff Condition"
          condition={takeoff}
          maxWeight={aircraft.maxTakeoffWeight}
          accentColor="sky"
        />
        <ConditionCard
          label="Landing Condition"
          condition={landing}
          maxWeight={aircraft.maxLandingWeight}
          accentColor="amber"
        />
      </div>

      {/* Station Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
          Station Breakdown
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-2.5 font-medium">Station</th>
                <th className="text-right px-4 py-2.5 font-medium">Weight (lb)</th>
                <th className="text-right px-4 py-2.5 font-medium">Arm (in)</th>
                <th className="text-right px-4 py-2.5 font-medium">
                  Moment (lb-in)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {result.rows.map((row) => (
                <tr
                  key={row.stationId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">
                    {row.label}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-200">
                    {fmt(row.weight, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-500 dark:text-slate-400">
                    {fmt(row.arm, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-200">
                    {fmtInt(row.moment)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-100">
                <td className="px-4 py-3">Ramp Total</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmt(result.ramp.totalWeight, 1)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                  {fmt(result.ramp.cg, 1)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {fmtInt(result.ramp.totalMoment)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConditionCard({
  label,
  condition,
  maxWeight,
  accentColor,
}: {
  label: string;
  condition: ComputedCondition;
  maxWeight: number;
  accentColor: 'sky' | 'amber';
}) {
  const weightPct = Math.min(100, (condition.totalWeight / maxWeight) * 100);
  const weightOver = condition.totalWeight > maxWeight;
  const accentBar =
    accentColor === 'sky' ? 'bg-sky-500' : 'bg-amber-500';
  const accentText =
    accentColor === 'sky'
      ? 'text-sky-600 dark:text-sky-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-bold ${accentText}`}>{label}</h4>
        <div className={`w-1.5 h-6 rounded-full ${accentBar}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Total Weight" value={`${fmt(condition.totalWeight, 0)} lb`} />
        <Stat label="CG" value={`${fmt(condition.cg, 2)} in`} />
        {condition.cgPercentMAC !== null && (
          <Stat
            label="CG (% MAC)"
            value={`${fmt(condition.cgPercentMAC, 1)}%`}
          />
        )}
        <Stat
          label="Max Weight"
          value={`${fmtInt(maxWeight)} lb`}
          muted
        />
      </div>

      {/* Weight bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Weight</span>
          <span
            className={`tabular-nums font-medium ${weightOver ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}
          >
            {fmt(condition.totalWeight, 0)} / {fmtInt(maxWeight)} lb
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${weightOver ? 'bg-red-500' : accentBar}`}
            style={{ width: `${weightPct}%` }}
          />
        </div>
      </div>

      {/* Pass/Fail badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          label="Max Weight"
          pass={condition.withinMaxWeight}
        />
        <Badge label="Forward CG" pass={condition.withinForwardCG} />
        <Badge label="Aft CG" pass={condition.withinAftCG} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
        {label}
      </p>
      <p
        className={`text-base font-semibold tabular-nums ${muted ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}
      >
        {value}
      </p>
    </div>
  );
}

function Badge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${pass ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}
    >
      {pass ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5" />
      )}
      {label}
    </div>
  );
}
