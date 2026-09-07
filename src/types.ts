export interface Station {
  id: string;
  label: string;
  arm: number;
  maxWeight?: number;
  /** If true, the weight value is split equally across this many seats. */
  seatCount?: number;
}

export interface EnvelopePoint {
  weight: number;
  forwardArm: number;
  aftArm: number;
}

export interface Aircraft {
  id: string;
  name: string;
  registrationLabel: string;
  emptyWeight: number;
  emptyWeightArm: number;
  maxRampWeight: number;
  maxTakeoffWeight: number;
  maxLandingWeight: number;
  usableFuelGallons: number;
  fuelLbPerGallon: number;
  taxiFuelGallons: number;
  stations: Station[];
  cgEnvelope: EnvelopePoint[];
  mac?: {
    leadingEdgeArm: number;
    length: number;
  };
}

export interface StationEntry {
  stationId: string;
  weight: number;
}

export interface LoadingScenario {
  name: string;
  emptyWeight: number;
  emptyWeightArm: number;
  stationWeights: Record<string, number>;
  fuelMode: 'gallons' | 'pounds';
  fuelValue: number;
  tripFuelMode: 'gallons' | 'pounds';
  tripFuelValue: number;
  createdAt: number;
}

export interface ComputedRow {
  stationId: string;
  label: string;
  weight: number;
  arm: number;
  moment: number;
}

export interface ComputedCondition {
  totalWeight: number;
  totalMoment: number;
  cg: number;
  cgPercentMAC: number | null;
  withinMaxWeight: boolean;
  withinForwardCG: boolean;
  withinAftCG: boolean;
  withinEnvelope: boolean;
}

export interface ComputedResult {
  rows: ComputedRow[];
  ramp: ComputedCondition;
  takeoff: ComputedCondition;
  landing: ComputedCondition;
  fuelWeight: number;
  tripFuelWeight: number;
  taxiFuelWeight: number;
}
