// Calculation logic for Trombe Wall performance

import { ASSUMPTIONS, MATERIALS } from './constants';
import {
  FeedbackItem,
  Material,
  ScenarioPreset,
  TrombeInputs,
  TrombeResults,
} from './types';

const DEFAULT_BASELINE_INPUTS: TrombeInputs = {
  A_floor: 50,
  T_inside: 20,
  T_outside: 0,
  night_hours: 12,
  U_building: 0.35,
  A_envelope: 106,
  H_solar_day: 3,
  orientation_factor: 1,
  shading_factor: 0.9,
  A_glazing: 8,
  t_wall: 0.3,
  air_gap: 0.08,
  material: 'concrete',
  tau_glass: 0.7,
  U_glass: 2.8,
  alpha_abs: 0.9,
};

const SCENARIO_PRESETS: Record<string, ScenarioPreset> = {
  baseline: {
    name: 'baseline',
    label: 'Baseline',
    description: 'Balanced wall thickness and good solar access.',
    inputs: DEFAULT_BASELINE_INPUTS,
  },
  thinWall: {
    name: 'thinWall',
    label: 'Too thin wall',
    description: 'Lower storage capacity and shorter time lag.',
    inputs: {
      ...DEFAULT_BASELINE_INPUTS,
      t_wall: 0.1,
    },
  },
  poorSolar: {
    name: 'poorSolar',
    label: 'Poor solar access',
    description: 'Not enough solar energy reaches the wall.',
    inputs: {
      ...DEFAULT_BASELINE_INPUTS,
      shading_factor: 0.45,
      orientation_factor: 0.75,
    },
  },
  highLoss: {
    name: 'highLoss',
    label: 'High night loss',
    description: 'Collected heat is partly lost back through the glazing.',
    inputs: {
      ...DEFAULT_BASELINE_INPUTS,
      U_glass: 5,
      T_outside: -8,
    },
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Estimate thermal time lag based on material and wall thickness.
 * Time lag is the delay between peak solar gain and peak heat release into the room.
 */
export function estimateTimeLag(material: Material, t_wall: number): string {
  const materialName = material.name;

  if (materialName.includes('Concrete') || materialName.includes('Brick')) {
    if (t_wall < 0.25) {
      return 'Short lag: afternoon / early evening heat';
    }

    if (t_wall <= 0.35) {
      return 'Typical lag: evening heat release, around 8–12 hours';
    }

    return 'Long lag: evening to night heat release';
  }

  if (materialName.includes('Adobe') || materialName.includes('Earth')) {
    if (t_wall < 0.15) {
      return 'Short lag: afternoon heat';
    }

    if (t_wall <= 0.25) {
      return 'Typical lag: evening heat release';
    }

    return 'Longer lag: evening to night heat release';
  }

  if (materialName.includes('Water')) {
    if (t_wall < 0.2) {
      return 'Low storage depth, faster response';
    }

    return 'Good storage potential, faster response than masonry';
  }

  return 'Unknown';
}

/**
 * Calculate a cavity-depth multiplier for the schematic design estimate.
 * The default cavity depth stays close to the baseline value, while shallower or
 * deeper gaps slightly reduce the effective heat release.
 */
function calculateCavityConvectionEfficiency(air_gap: number): number {
  const optimal_gap = 0.1;
  const spread = 0.05;
  const gaussian = Math.exp(-Math.pow((air_gap - optimal_gap) / spread, 2));

  return clamp(0.92 + 0.08 * gaussian, 0.9, 1.03);
}

function generateCoverageMessage(coverage_ratio: number): string {
  if (coverage_ratio < 0.25) {
    return 'Small contribution: useful as support, not primary heating.';
  }

  if (coverage_ratio <= 0.6) {
    return 'Moderate contribution: can reduce heating demand.';
  }

  if (coverage_ratio <= 1) {
    return 'Strong contribution: may cover much of the night load under these assumptions.';
  }

  return 'Theoretical surplus: check overheating, losses, and realistic heat release timing.';
}

/**
 * Create grouped feedback for the main design logic.
 */
export function generateFeedback(
  inputs: TrombeInputs,
  results: Pick<TrombeResults, 'Q_absorbed' | 'Q_loss' | 'Q_net' | 'coverage_ratio' | 'Q_night_demand'>,
  material: Material
): FeedbackItem[] {
  const solarIndex = inputs.orientation_factor * inputs.shading_factor;
  const storageRange = material.thicknessRange;
  const lossRatio = results.Q_absorbed > 0 ? results.Q_loss / results.Q_absorbed : 0;

  let solarStatus: FeedbackItem['status'];
  let solarExplanation: string;
  if (solarIndex >= 0.8) {
    solarStatus = 'good';
    solarExplanation = 'Good solar access: most of the incident sun reaches the wall.';
  } else if (solarIndex >= 0.55) {
    solarStatus = 'reduced';
    solarExplanation = 'Reduced solar access: some useful gain is lost to shading or orientation.';
  } else {
    solarStatus = 'poor';
    solarExplanation = 'Poor solar access: too little sun reaches the glazing for strong performance.';
  }

  let storageStatus: FeedbackItem['status'];
  let storageExplanation: string;
  if (inputs.t_wall < storageRange[0]) {
    storageStatus = 'insufficient';
    storageExplanation = 'Insufficient storage depth: the wall may heat up too quickly and release too soon.';
  } else if (inputs.t_wall <= storageRange[1]) {
    storageStatus = 'balanced';
    storageExplanation = 'Balanced storage depth: the wall thickness is in a useful schematic range.';
  } else {
    storageStatus = 'heavy and slow';
    storageExplanation = 'Heavy and slow: the wall stores more energy but responds later and more sluggishly.';
  }

  let lossStatus: FeedbackItem['status'];
  let lossExplanation: string;
  if (lossRatio < 0.3) {
    lossStatus = 'low';
    lossExplanation = 'Low losses: the glazing is keeping most of the collected heat.';
  } else if (lossRatio <= 0.6) {
    lossStatus = 'moderate';
    lossExplanation = 'Moderate losses: some useful heat is leaking back through the glazing at night.';
  } else {
    lossStatus = 'high';
    lossExplanation = 'High losses: the glazing is leaking a large share of the collected heat.';
  }

  let feasibilityStatus: FeedbackItem['status'];
  let feasibilityExplanation: string;
  if (results.Q_net <= 0 || results.coverage_ratio < 0.25) {
    feasibilityStatus = 'weak';
    feasibilityExplanation = 'Weak feasibility: this looks like a support strategy rather than a main heating source.';
  } else if (results.coverage_ratio <= 0.6) {
    feasibilityStatus = 'moderate';
    feasibilityExplanation = 'Moderate feasibility: the wall can reduce heating demand under these assumptions.';
  } else {
    feasibilityStatus = 'strong';
    feasibilityExplanation = 'Strong feasibility: the wall may cover much of the modeled night load, if timing and losses are realistic.';
  }

  return [
    {
      category: 'Solar access',
      status: solarStatus,
      explanation: solarExplanation,
    },
    {
      category: 'Storage',
      status: storageStatus,
      explanation: storageExplanation,
    },
    {
      category: 'Losses',
      status: lossStatus,
      explanation: lossExplanation,
    },
    {
      category: 'Feasibility',
      status: feasibilityStatus,
      explanation: feasibilityExplanation,
    },
  ];
}

/**
 * Main calculation function for Trombe wall performance.
 * Applies simplified schematic design formulas.
 */
export function calculateTrombeWall(inputs: TrombeInputs): TrombeResults {
  const material = MATERIALS[inputs.material as keyof typeof MATERIALS];

  if (!material) {
    throw new Error(`Unknown material: ${inputs.material}`);
  }

  const A_wall = inputs.A_glazing;
  const V_wall = A_wall * inputs.t_wall;
  const m_wall = material.rho * V_wall;
  const Q_storage_kWh = (m_wall * material.c_p * ASSUMPTIONS.deltaT_wall) / 3600;

  const Q_solar_incident = inputs.H_solar_day * inputs.A_glazing;
  const Q_absorbed =
    Q_solar_incident *
    inputs.tau_glass *
    inputs.alpha_abs *
    inputs.shading_factor *
    inputs.orientation_factor;

  const deltaT_loss = Math.max(0, inputs.T_inside - inputs.T_outside);
  const Q_loss = (inputs.U_glass * inputs.A_glazing * deltaT_loss * inputs.night_hours) / 1000;

  const cavity_efficiency = calculateCavityConvectionEfficiency(inputs.air_gap);
  const effective_efficiency = ASSUMPTIONS.efficiency_factor * cavity_efficiency;
  const Q_net_raw = Q_absorbed * effective_efficiency - Q_loss;
  const Q_net = Math.max(0, Q_net_raw);

  const P_loss = inputs.U_building * inputs.A_envelope * deltaT_loss;
  const Q_night_demand = (P_loss * inputs.night_hours) / 1000;
  const coverage_ratio = Q_night_demand > 0 ? Q_net / Q_night_demand : 0;
  const coverage_percent = coverage_ratio * 100;

  const wall_ratio = A_wall / inputs.A_glazing;
  const glazing_floor_ratio = inputs.A_glazing / inputs.A_floor;
  const glazing_floor_ratio_percent = glazing_floor_ratio * 100;
  const time_lag_description = estimateTimeLag(material, inputs.t_wall);
  const feasibility_message = generateCoverageMessage(coverage_ratio);

  const feedback = generateFeedback(
    inputs,
    { Q_absorbed, Q_loss, Q_net, coverage_ratio, Q_night_demand },
    material
  );

  const warnings = [
    ...feedback.map((item) => `${item.category}: ${item.explanation}`),
    'Simplified schematic-design estimate: use this for early concept comparison only.',
  ];

  return {
    A_wall,
    V_wall,
    m_wall,
    Q_storage_kWh,
    Q_solar_incident,
    Q_absorbed,
    deltaT_loss,
    Q_loss,
    Q_net,
    P_loss,
    Q_night_demand,
    coverage_ratio,
    coverage_percent,
    wall_ratio,
    glazing_floor_ratio,
    glazing_floor_ratio_percent,
    cavity_efficiency,
    feedback,
    time_lag_description,
    feasibility_message,
    warnings,
  };
}

export function calculateTrombeWallWithMaterialOverride(
  inputs: TrombeInputs,
  materialOverride?: Material
): TrombeResults {
  if (!materialOverride) {
    return calculateTrombeWall(inputs);
  }

  const baseMaterial = MATERIALS[inputs.material as keyof typeof MATERIALS];

  if (!baseMaterial) {
    throw new Error(`Unknown material: ${inputs.material}`);
  }

  const material = materialOverride;

  const A_wall = inputs.A_glazing;
  const V_wall = A_wall * inputs.t_wall;
  const m_wall = material.rho * V_wall;
  const Q_storage_kWh = (m_wall * material.c_p * ASSUMPTIONS.deltaT_wall) / 3600;

  const Q_solar_incident = inputs.H_solar_day * inputs.A_glazing;
  const Q_absorbed =
    Q_solar_incident *
    inputs.tau_glass *
    inputs.alpha_abs *
    inputs.shading_factor *
    inputs.orientation_factor;

  const deltaT_loss = Math.max(0, inputs.T_inside - inputs.T_outside);
  const Q_loss = (inputs.U_glass * inputs.A_glazing * deltaT_loss * inputs.night_hours) / 1000;

  const cavity_efficiency = calculateCavityConvectionEfficiency(inputs.air_gap);
  const effective_efficiency = ASSUMPTIONS.efficiency_factor * cavity_efficiency;
  const Q_net_raw = Q_absorbed * effective_efficiency - Q_loss;
  const Q_net = Math.max(0, Q_net_raw);

  const P_loss = inputs.U_building * inputs.A_envelope * deltaT_loss;
  const Q_night_demand = (P_loss * inputs.night_hours) / 1000;
  const coverage_ratio = Q_night_demand > 0 ? Q_net / Q_night_demand : 0;
  const coverage_percent = coverage_ratio * 100;

  const wall_ratio = A_wall / inputs.A_glazing;
  const glazing_floor_ratio = inputs.A_glazing / inputs.A_floor;
  const glazing_floor_ratio_percent = glazing_floor_ratio * 100;
  const time_lag_description = estimateTimeLag(material, inputs.t_wall);
  const feasibility_message = generateCoverageMessage(coverage_ratio);

  const feedback = generateFeedback(
    inputs,
    { Q_absorbed, Q_loss, Q_net, coverage_ratio, Q_night_demand },
    material
  );

  const warnings = [
    ...feedback.map((item) => `${item.category}: ${item.explanation}`),
    'Simplified schematic-design estimate: use this for early concept comparison only.',
  ];

  return {
    A_wall,
    V_wall,
    m_wall,
    Q_storage_kWh,
    Q_solar_incident,
    Q_absorbed,
    deltaT_loss,
    Q_loss,
    Q_net,
    P_loss,
    Q_night_demand,
    coverage_ratio,
    coverage_percent,
    wall_ratio,
    glazing_floor_ratio,
    glazing_floor_ratio_percent,
    cavity_efficiency,
    feedback,
    time_lag_description,
    feasibility_message,
    warnings,
  };
}

export function getScenarioPreset(name: string): ScenarioPreset {
  const preset = SCENARIO_PRESETS[name];

  if (!preset) {
    return SCENARIO_PRESETS.baseline;
  }

  return preset;
}
