import { useMemo } from 'react';
import { Fuel, Gauge, Package, Users, Plane } from 'lucide-react';
import type { Aircraft } from '@/types';
import { convertFuel, convertFuelToGallons } from '@/lib/calc';

interface Props {
  aircraft: Aircraft;
  emptyWeight: number;
  setEmptyWeight: (v: number) => void;
  emptyWeightArm: number;
  setEmptyWeightArm: (v: number) => void;
  stationWeights: Record<string, number>;
  setStationWeight: (id: string, v: number) => void;
  fuelMode: 'gallons' | 'pounds';
  setFuelMode: (m: 'gallons' | 'pounds') => void;
  fuelValue: number;
  setFuelValue: (v: number) => void;
  tripFuelMode: 'gallons' | 'pounds';
  setTripFuelMode: (m: 'gallons' | 'pounds') => void;
  tripFuelValue: number;
  setTripFuelValue: (v: number) => void;
}

export function LoadingForm({
  aircraft,
  emptyWeight,
  setEmptyWeight,
  emptyWeightArm,
  setEmptyWeightArm,
  stationWeights,
  setStationWeight,
  fuelMode,
  setFuelMode,
  fuelValue,
  setFuelValue,
  tripFuelMode,
  setTripFuelMode,
  tripFuelValue,
  setTripFuelValue,
}: Props) {
  const maxFuelWeight = aircraft.usableFuelGallons * aircraft.fuelLbPerGallon;
  const fuelGallons = useMemo(
    () => convertFuelToGallons(fuelValue, fuelMode, aircraft.fuelLbPerGallon),
    [fuelValue, fuelMode, aircraft.fuelLbPerGallon],
  );
  const fuelOverCap = fuelGallons > aircraft.usableFuelGallons;

  const tripFuelGallons = useMemo(
    () => convertFuelToGallons(tripFuelValue, tripFuelMode, aircraft.fuelLbPerGallon),
    [tripFuelValue, tripFuelMode, aircraft.fuelLbPerGallon],
  );
  const tripOverFuel = tripFuelGallons > fuelGallons;

  return (
    <div className="space-y-5">
      {/* Empty Weight */}
      <Section icon={<Plane className="w-4 h-4" />} title="Aircraft Empty Weight">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Pre-filled from the aircraft profile. Replace with values from this
          aircraft's current Weight &amp; Balance report — empty weight changes
          with equipment installations.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Empty Weight (lb)">
            <input
              type="number"
              value={emptyWeight || ''}
              onChange={(e) => setEmptyWeight(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Empty CG Arm (in)">
            <input
              type="number"
              step="0.1"
              value={emptyWeightArm || ''}
              onChange={(e) => setEmptyWeightArm(Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Stations */}
      <Section icon={<Users className="w-4 h-4" />} title="Loading Stations">
        <div className="space-y-3">
          {aircraft.stations.map((station) => {
            const w = stationWeights[station.id] || 0;
            const overLimit = station.maxWeight ? w > station.maxWeight : false;
            return (
              <div
                key={station.id}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3"
              >
                <div className="flex-1">
                  <Field
                    label={station.label}
                    hint={station.seatCount ? `${station.seatCount} seats` : undefined}
                  >
                    <input
                      type="number"
                      value={w || ''}
                      onChange={(e) =>
                        setStationWeight(station.id, Number(e.target.value))
                      }
                      className={`${inputCls} ${overLimit ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-3 pb-1">
                  <div className="text-right">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      Arm
                    </span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      {station.arm.toFixed(1)} in
                    </span>
                  </div>
                  {station.maxWeight && (
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                        Max
                      </span>
                      <span
                        className={`text-sm font-medium tabular-nums ${overLimit ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        {station.maxWeight} lb
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Fuel */}
      <Section icon={<Fuel className="w-4 h-4" />} title="Fuel">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Fuel Load">
            <input
              type="number"
              value={fuelValue || ''}
              onChange={(e) => setFuelValue(Number(e.target.value))}
              className={`${inputCls} ${fuelOverCap ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
          </Field>
          <Field label="Unit">
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden h-[42px]">
              <button
                onClick={() => setFuelMode('gallons')}
                className={`flex-1 text-sm font-medium transition-colors ${fuelMode === 'gallons' ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Gallons
              </button>
              <button
                onClick={() => setFuelMode('pounds')}
                className={`flex-1 text-sm font-medium transition-colors ${fuelMode === 'pounds' ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Pounds
              </button>
            </div>
          </Field>
        </div>
        {fuelOverCap && (
          <p className="text-xs text-red-500 font-medium mb-2">
            Exceeds usable fuel capacity ({aircraft.usableFuelGallons} gal /{' '}
            {maxFuelWeight} lb)
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Gauge className="w-3.5 h-3.5" />
          <span>
            {fuelGallons.toFixed(1)} gal ={' '}
            {convertFuel(fuelValue, fuelMode, aircraft.fuelLbPerGallon).toFixed(0)} lb
            {' · '}max {aircraft.usableFuelGallons} gal
          </span>
        </div>
      </Section>

      {/* Trip Fuel */}
      <Section icon={<Package className="w-4 h-4" />} title="Trip Fuel Burn">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Fuel burned during the flight. Used to compute landing weight and CG.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trip Fuel Burn">
            <input
              type="number"
              value={tripFuelValue || ''}
              onChange={(e) => setTripFuelValue(Number(e.target.value))}
              className={`${inputCls} ${tripOverFuel ? 'border-red-500 ring-1 ring-red-500' : ''}`}
            />
          </Field>
          <Field label="Unit">
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden h-[42px]">
              <button
                onClick={() => setTripFuelMode('gallons')}
                className={`flex-1 text-sm font-medium transition-colors ${tripFuelMode === 'gallons' ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Gallons
              </button>
              <button
                onClick={() => setTripFuelMode('pounds')}
                className={`flex-1 text-sm font-medium transition-colors ${tripFuelMode === 'pounds' ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Pounds
              </button>
            </div>
          </Field>
        </div>
        {tripOverFuel && (
          <p className="text-xs text-red-500 font-medium mt-2">
            Trip fuel burn exceeds fuel load — landing weight will be zero fuel.
          </p>
        )}
      </Section>
    </div>
  );
}

const inputCls =
  'w-full h-[42px] px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent tabular-nums transition-colors';

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sky-500">{icon}</span>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
        {label}
        {hint && (
          <span className="ml-1.5 text-slate-400 font-normal">· {hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
