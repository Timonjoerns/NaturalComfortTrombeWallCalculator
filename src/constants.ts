// Material properties library for Trombe walls

import { MaterialLibrary } from './types';

export const MATERIALS: MaterialLibrary = {
  concrete: {
    name: 'Concrete',
    rho: 2300, // kg/m³
    c_p: 0.84, // kJ/kgK
    k: 1.6, // W/mK
    thicknessRange: [0.25, 0.35],
  },
  brick: {
    name: 'Brick',
    rho: 1800, // kg/m³
    c_p: 0.84, // kJ/kgK
    k: 0.8, // W/mK
    thicknessRange: [0.25, 0.35],
  },
  adobe: {
    name: 'Adobe / Earth',
    rho: 1700, // kg/m³
    c_p: 0.90, // kJ/kgK
    k: 0.7, // W/mK
    thicknessRange: [0.15, 0.25],
  },
  water: {
    name: 'Water Wall',
    rho: 1000, // kg/m³
    c_p: 4.18, // kJ/kgK
    k: 0.6, // W/mK
    thicknessRange: [0.20, 0.50],
  },
};

export const MATERIAL_OPTIONS = Object.entries(MATERIALS).map(([key, value]) => ({
  id: key,
  name: value.name,
}));

// Design assumptions
export const ASSUMPTIONS = {
  deltaT_wall: 10, // K, useful wall temperature rise
  efficiency_factor: 0.5, // factor for solar gain conversion to useful heat
};
