import type { Aircraft } from '@/types';

/**
 * ⚠️  PLACEHOLDER DATA — MUST BE VERIFIED BEFORE FLIGHT
 *
 * Every value below is a representative placeholder for a Cessna 206
 * Stationair on Wipaire Wipline 8750 amphibious floats. Real empty
 * weight, arms, max weights, and CG envelope vary significantly
 * aircraft-to-aircraft and MUST be replaced with values from the
 * specific aircraft's current Weight & Balance report and POH
 * Supplement before any real-world flight planning use.
 *
 * Sources for typical values: Wipaire 8750 float STC documentation
 * and Cessna 206 POH. Treat all numbers as unverified placeholders.
 */
export const cessna206Amphibian: Aircraft = {
  id: 'cessna-206-amphibian',
  name: 'Cessna 206 Stationair Amphibian',
  registrationLabel: 'HATEST',
  emptyWeight: 2204,
  emptyWeightArm: 34.66,
  maxRampWeight: 3850,
  maxTakeoffWeight: 3800,
  maxLandingWeight: 3650,
  usableFuelGallons: 84,
  fuelLbPerGallon: 6,
  taxiFuelGallons: 1.5,
  stations: [
    { id: 'front-seats', label: 'Front Seats (Pilot + Pax)', arm: 37, maxWeight: 400, seatCount: 2 },
    { id: 'mid-seats', label: 'Mid Seats (2 Pax)', arm: 70, maxWeight: 400, seatCount: 2 },
    { id: 'aft-seats', label: 'Aft Seats (2 Pax)', arm: 97, maxWeight: 400, seatCount: 2 },
    { id: 'baggage', label: 'Baggage Area', arm: 142, maxWeight: 200 },
    { id: 'cargo-pod', label: 'Cargo Pod (if equipped)', arm: 95, maxWeight: 300 },
    { id: 'float-compartment', label: 'Float Storage Compartments', arm: 130, maxWeight: 120 },
  ],
  cgEnvelope: [
    // { weight: 2200, forwardArm: 106.0, aftArm: 119.0 },
    // { weight: 2700, forwardArm: 106.0, aftArm: 119.5 },
    // { weight: 3200, forwardArm: 106.0, aftArm: 120.0 },
    // { weight: 3650, forwardArm: 106.0, aftArm: 120.5 },
    // { weight: 3800, forwardArm: 107.0, aftArm: 120.5 },

    { weight: 2000, forwardArm: 33.0, aftArm: 49.8 },
    { weight: 2500, forwardArm: 33, aftArm: 49.8 },
    { weight: 3600, forwardArm: 43.0, aftArm: 49.8 }
  ],
  mac: {
    leadingEdgeArm: 103.0,
    length: 58.6,
  },
};

export const aircraftList: Aircraft[] = [cessna206Amphibian];

export const defaultAircraft = cessna206Amphibian;
