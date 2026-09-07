import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plane, Sun, Moon, AlertTriangle, RotateCcw } from 'lucide-react';
import { defaultAircraft } from '@/data/aircraft';
import { computeResult, convertFuel } from '@/lib/calc';
import {
  loadScenarios,
  saveScenario,
  deleteScenario,
} from '@/lib/storage';
import type { LoadingScenario } from '@/types';
import { LoadingForm } from '@/components/LoadingForm';
import { CGChart } from '@/components/CGChart';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SavedScenarios } from '@/components/SavedScenarios';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('aerobalance.theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function App() {
  const aircraft = defaultAircraft;

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [emptyWeight, setEmptyWeight] = useState(aircraft.emptyWeight);
  const [emptyWeightArm, setEmptyWeightArm] = useState(aircraft.emptyWeightArm);
  const [stationWeights, setStationWeights] = useState<Record<string, number>>(
    {},
  );
  const [fuelMode, setFuelMode] = useState<'gallons' | 'pounds'>('gallons');
  const [fuelValue, setFuelValue] = useState(60);
  const [tripFuelMode, setTripFuelMode] = useState<'gallons' | 'pounds'>(
    'gallons',
  );
  const [tripFuelValue, setTripFuelValue] = useState(20);
  const [scenarios, setScenarios] = useState<LoadingScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<LoadingScenario | null>(
    null,
  );

  useEffect(() => {
    localStorage.setItem('aerobalance.theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const setStationWeight = useCallback((id: string, v: number) => {
    setStationWeights((prev) => ({ ...prev, [id]: v }));
  }, []);

  const fuelWeight = convertFuel(
    fuelValue,
    fuelMode,
    aircraft.fuelLbPerGallon,
  );
  const tripFuelWeight = convertFuel(
    tripFuelValue,
    tripFuelMode,
    aircraft.fuelLbPerGallon,
  );
  const taxiFuelWeight = aircraft.taxiFuelGallons * aircraft.fuelLbPerGallon;

  const result = useMemo(
    () =>
      computeResult(
        aircraft,
        emptyWeight,
        emptyWeightArm,
        stationWeights,
        fuelWeight,
        tripFuelWeight,
        taxiFuelWeight,
      ),
    [
      aircraft,
      emptyWeight,
      emptyWeightArm,
      stationWeights,
      fuelWeight,
      tripFuelWeight,
      taxiFuelWeight,
    ],
  );

  const handleSave = useCallback(
    (name: string) => {
      const scenario: LoadingScenario = {
        name,
        emptyWeight,
        emptyWeightArm,
        stationWeights,
        fuelMode,
        fuelValue,
        tripFuelMode,
        tripFuelValue,
        createdAt: Date.now(),
      };
      const updated = saveScenario(scenario);
      setScenarios(updated);
      setCurrentScenario(scenario);
    },
    [
      emptyWeight,
      emptyWeightArm,
      stationWeights,
      fuelMode,
      fuelValue,
      tripFuelMode,
      tripFuelValue,
    ],
  );

  const handleLoad = useCallback((s: LoadingScenario) => {
    setEmptyWeight(s.emptyWeight);
    setEmptyWeightArm(s.emptyWeightArm);
    setStationWeights(s.stationWeights);
    setFuelMode(s.fuelMode);
    setFuelValue(s.fuelValue);
    setTripFuelMode(s.tripFuelMode);
    setTripFuelValue(s.tripFuelValue);
    setCurrentScenario(s);
  }, []);

  const handleDelete = useCallback((name: string, createdAt: number) => {
    const updated = deleteScenario(name, createdAt);
    setScenarios(updated);
    if (
      currentScenario?.name === name &&
      currentScenario?.createdAt === createdAt
    ) {
      setCurrentScenario(null);
    }
  }, [currentScenario]);

  const handleReset = useCallback(() => {
    setEmptyWeight(aircraft.emptyWeight);
    setEmptyWeightArm(aircraft.emptyWeightArm);
    setStationWeights({});
    setFuelMode('gallons');
    setFuelValue(60);
    setTripFuelMode('gallons');
    setTripFuelValue(20);
    setCurrentScenario(null);
  }, [aircraft]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                AeroBalance
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {aircraft.name} · {aircraft.registrationLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>For planning reference only.</strong> Always verify against
            the current, aircraft-specific POH and weight &amp; balance report
            before flight. Aircraft data contains placeholder values that must
            be replaced with your aircraft's actual numbers.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form + Saved Scenarios */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
                Loading Form
              </h2>
              <LoadingForm
                aircraft={aircraft}
                emptyWeight={emptyWeight}
                setEmptyWeight={setEmptyWeight}
                emptyWeightArm={emptyWeightArm}
                setEmptyWeightArm={setEmptyWeightArm}
                stationWeights={stationWeights}
                setStationWeight={setStationWeight}
                fuelMode={fuelMode}
                setFuelMode={setFuelMode}
                fuelValue={fuelValue}
                setFuelValue={setFuelValue}
                tripFuelMode={tripFuelMode}
                setTripFuelMode={setTripFuelMode}
                tripFuelValue={tripFuelValue}
                setTripFuelValue={setTripFuelValue}
              />
            </div>
            <SavedScenarios
              scenarios={scenarios}
              currentScenario={currentScenario}
              onSave={handleSave}
              onLoad={handleLoad}
              onDelete={handleDelete}
            />
          </div>

          {/* Right: Chart + Results */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
                CG Envelope
              </h2>
              <CGChart
                envelope={aircraft.cgEnvelope}
                takeoff={result.takeoff}
                landing={result.landing}
              />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
              <ResultsPanel aircraft={aircraft} result={result} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          <p>
            AeroBalance · Weight &amp; Balance Calculator · Client-side only,
            no data leaves your device
          </p>
        </footer>
      </main>
    </div>
  );
}
