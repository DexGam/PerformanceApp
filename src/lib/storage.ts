import type { LoadingScenario } from '@/types';

const KEY = 'aerobalance.scenarios';

export function loadScenarios(): LoadingScenario[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LoadingScenario[];
  } catch {
    return [];
  }
}

export function saveScenariosList(scenarios: LoadingScenario[]): void {
  localStorage.setItem(KEY, JSON.stringify(scenarios));
}

export function saveScenario(scenario: LoadingScenario): LoadingScenario[] {
  const existing = loadScenarios();
  const idx = existing.findIndex(
    (s) => s.name === scenario.name && s.createdAt === scenario.createdAt,
  );
  let updated: LoadingScenario[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = scenario;
  } else {
    updated = [...existing, scenario];
  }
  saveScenariosList(updated);
  return updated;
}

export function deleteScenario(name: string, createdAt: number): LoadingScenario[] {
  const existing = loadScenarios();
  const updated = existing.filter(
    (s) => !(s.name === name && s.createdAt === createdAt),
  );
  saveScenariosList(updated);
  return updated;
}
