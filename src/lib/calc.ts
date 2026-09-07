import type {
  Aircraft,
  ComputedCondition,
  ComputedResult,
  ComputedRow,
  EnvelopePoint,
} from '@/types';

export function convertFuel(
  value: number,
  mode: 'gallons' | 'pounds',
  lbPerGallon: number,
): number {
  if (value <= 0) return 0;
  return mode === 'gallons' ? value * lbPerGallon : value;
}

export function convertFuelToGallons(
  value: number,
  mode: 'gallons' | 'pounds',
  lbPerGallon: number,
): number {
  if (value <= 0) return 0;
  return mode === 'gallons' ? value : value / lbPerGallon;
}

function computePercentMAC(
  cg: number,
  mac?: { leadingEdgeArm: number; length: number },
): number | null {
  if (!mac || mac.length === 0) return null;
  return ((cg - mac.leadingEdgeArm) / mac.length) * 100;
}

function buildCondition(
  rows: ComputedRow[],
  maxWeight: number,
  envelope: EnvelopePoint[],
  mac?: { leadingEdgeArm: number; length: number },
): ComputedCondition {
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const totalMoment = rows.reduce((s, r) => s + r.moment, 0);
  const cg = totalWeight > 0 ? totalMoment / totalWeight : 0;
  const cgPercentMAC = computePercentMAC(cg, mac);

  const withinMaxWeight = totalWeight <= maxWeight;
  const { forwardOK, aftOK } = checkEnvelope(totalWeight, cg, envelope);

  return {
    totalWeight,
    totalMoment,
    cg,
    cgPercentMAC,
    withinMaxWeight,
    withinForwardCG: forwardOK,
    withinAftCG: aftOK,
    withinEnvelope: withinMaxWeight && forwardOK && aftOK,
  };
}

export function checkEnvelope(
  weight: number,
  cg: number,
  envelope: EnvelopePoint[],
): { forwardOK: boolean; aftOK: boolean } {
  if (envelope.length === 0) return { forwardOK: true, aftOK: true };

  const sorted = [...envelope].sort((a, b) => a.weight - b.weight);
  const minW = sorted[0].weight;
  const maxW = sorted[sorted.length - 1].weight;

  if (weight < minW || weight > maxW) {
    // Out of envelope weight range — check if CG is within any boundary
    return { forwardOK: false, aftOK: false };
  }

  // Find the segment that brackets this weight
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (weight >= sorted[i].weight && weight <= sorted[i + 1].weight) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const range = upper.weight - lower.weight || 1;
  const ratio = (weight - lower.weight) / range;
  const forwardLimit = lower.forwardArm + (upper.forwardArm - lower.forwardArm) * ratio;
  const aftLimit = lower.aftArm + (upper.aftArm - lower.aftArm) * ratio;

  return {
    forwardOK: cg >= forwardLimit,
    aftOK: cg <= aftLimit,
  };
}

export function computeResult(
  aircraft: Aircraft,
  emptyWeight: number,
  emptyWeightArm: number,
  stationWeights: Record<string, number>,
  fuelWeight: number,
  tripFuelWeight: number,
  taxiFuelWeight: number,
): ComputedResult {
  const rows: ComputedRow[] = [];

  // Empty weight
  rows.push({
    stationId: 'empty',
    label: 'Basic Empty Weight',
    weight: emptyWeight,
    arm: emptyWeightArm,
    moment: emptyWeight * emptyWeightArm,
  });

  // Stations
  for (const station of aircraft.stations) {
    const w = stationWeights[station.id] || 0;
    if (w !== 0) {
      rows.push({
        stationId: station.id,
        label: station.label,
        weight: w,
        arm: station.arm,
        moment: w * station.arm,
      });
    }
  }

  // Fuel station (ramp fuel)
  if (fuelWeight > 0) {
    rows.push({
      stationId: 'fuel',
      label: 'Fuel (Ramp)',
      weight: fuelWeight,
      arm: 110,
      moment: fuelWeight * 110,
    });
  }

  const env = aircraft.cgEnvelope;
  const mac = aircraft.mac;

  // Ramp condition (all rows, max = ramp weight)
  const ramp = buildCondition(rows, aircraft.maxRampWeight, env, mac);

  // Takeoff: subtract taxi fuel
  const takeoffRows = rows.map((r) =>
    r.stationId === 'fuel'
      ? {
          ...r,
          weight: Math.max(0, r.weight - taxiFuelWeight),
          moment: Math.max(0, r.weight - taxiFuelWeight) * r.arm,
        }
      : r,
  );
  const takeoff = buildCondition(takeoffRows, aircraft.maxTakeoffWeight, env, mac);

  // Landing: subtract trip fuel from takeoff fuel
  const landingRows = takeoffRows.map((r) =>
    r.stationId === 'fuel'
      ? {
          ...r,
          weight: Math.max(0, r.weight - tripFuelWeight),
          moment: Math.max(0, r.weight - tripFuelWeight) * r.arm,
        }
      : r,
  );
  const landing = buildCondition(landingRows, aircraft.maxLandingWeight, env, mac);

  return {
    rows,
    ramp,
    takeoff,
    landing,
    fuelWeight,
    tripFuelWeight,
    taxiFuelWeight,
  };
}
