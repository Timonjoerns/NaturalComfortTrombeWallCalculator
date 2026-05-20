// TypeScript interfaces and types for Trombe Wall Calculator

export interface Material {
  name: string;
  rho: number; // kg/m³
  c_p: number; // kJ/kgK
  k: number; // W/mK
  thicknessRange: [number, number]; // min and max recommended thickness
}

export interface FeedbackItem {
  category: 'Solar access' | 'Storage' | 'Losses' | 'Feasibility';
  status:
    | 'good'
    | 'reduced'
    | 'poor'
    | 'insufficient'
    | 'balanced'
    | 'heavy and slow'
    | 'low'
    | 'moderate'
    | 'high'
    | 'weak'
    | 'strong';
  explanation: string;
}

export interface ScenarioPreset {
  name: string;
  label: string;
  description: string;
  inputs: TrombeInputs;
}

export interface TrombeInputs {
  // Building / room
  A_floor: number; // m²
  T_inside: number; // °C
  T_outside: number; // °C
  night_hours: number; // h
  U_building: number; // W/m²K
  A_envelope: number; // m²

  // Climate / solar
  H_solar_day: number; // kWh/m²/day
  orientation_factor: number; // 0-1
  shading_factor: number; // 0-1

  // Trombe wall geometry
  A_glazing: number; // m²
  t_wall: number; // m
  air_gap: number; // m

  // Material
  material: string; // Material name

  // Glazing
  tau_glass: number; // 0-1
  U_glass: number; // W/m²K
  alpha_abs: number; // 0-1
}

export interface TrombeResults {
  // Calculated values
  A_wall: number;
  V_wall: number;
  m_wall: number;
  Q_storage_kWh: number;
  Q_solar_incident: number;
  Q_absorbed: number;
  deltaT_loss: number;
  Q_loss: number;
  Q_net: number;
  P_loss: number;
  Q_night_demand: number;
  coverage_ratio: number;
  coverage_percent: number;
  wall_ratio: number;
  glazing_floor_ratio: number;
  glazing_floor_ratio_percent: number;
  cavity_efficiency: number;
  feedback: FeedbackItem[];

  // Qualitative
  time_lag_description: string;
  feasibility_message: string;

  // Warnings
  warnings: string[];
}

export interface MaterialLibrary {
  [key: string]: Material;
}
