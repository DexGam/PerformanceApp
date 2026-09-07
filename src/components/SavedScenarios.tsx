import { useState } from 'react';
import { Save, FolderOpen, Trash2, X } from 'lucide-react';
import type { LoadingScenario } from '@/types';

interface Props {
  scenarios: LoadingScenario[];
  currentScenario: LoadingScenario | null;
  onSave: (name: string) => void;
  onLoad: (scenario: LoadingScenario) => void;
  onDelete: (name: string, createdAt: number) => void;
}

export function SavedScenarios({
  scenarios,
  currentScenario,
  onSave,
  onLoad,
  onDelete,
}: Props) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    setShowInput(false);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="w-4 h-4 text-sky-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Saved Scenarios
        </h3>
      </div>

      {showInput && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Fishing trip - 4 pax"
            autoFocus
            className="flex-1 h-[38px] px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={handleSave}
            className="h-[38px] px-3 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setShowInput(false);
              setName('');
            }}
            className="h-[38px] w-[38px] flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!showInput && (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 h-[38px] rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm font-medium hover:border-sky-500 hover:text-sky-500 transition-colors mb-3"
        >
          <Save className="w-4 h-4" />
          Save Current Scenario
        </button>
      )}

      {scenarios.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">
          No saved scenarios yet
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {scenarios.map((s) => {
            const isActive =
              currentScenario?.name === s.name &&
              currentScenario?.createdAt === s.createdAt;
            return (
              <div
                key={`${s.name}-${s.createdAt}`}
                className={`flex items-center gap-2 rounded-lg border transition-colors ${isActive ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
              >
                <button
                  onClick={() => onLoad(s)}
                  className="flex-1 text-left px-3 py-2 min-w-0"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {s.emptyWeight.toFixed(0)} lb ·{' '}
                    {s.fuelValue.toFixed(0)} {s.fuelMode} fuel
                  </p>
                </button>
                <button
                  onClick={() => onDelete(s.name, s.createdAt)}
                  className="shrink-0 p-2 mr-1 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Delete scenario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
