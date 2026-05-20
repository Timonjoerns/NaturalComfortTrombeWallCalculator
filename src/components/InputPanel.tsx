// Input panel with sliders and form controls

import React from 'react';
import { Material } from '../types';
import { TrombeInputs } from '../types';
import { MATERIAL_OPTIONS, MATERIALS } from '../constants';
import { MaterialDetail } from './MaterialDetail';

interface InputPanelProps {
  inputs: TrombeInputs;
  onInputChange: (updatedInputs: TrombeInputs) => void;
  materialOverride?: Material | undefined;
  onMaterialOverrideChange?: (m: Material | undefined) => void;
}

interface InputFieldProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  helper?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  helper,
}) => {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-2 gap-3">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-baseline space-x-3">
          <span className="text-sm font-mono text-slate-600">
            {Number.isFinite(value) ? value.toFixed(step < 1 ? 2 : 1) : value}{' '}
            {unit}
          </span>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-slate-500"
      />
      {helper && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{helper}</p>}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
  helper?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  helper,
}) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {helper && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{helper}</p>}
    </div>
  );
};

export const InputPanel: React.FC<InputPanelProps> = ({
  inputs,
  onInputChange,
  materialOverride,
  onMaterialOverrideChange,
}) => {
  const handleChange = (field: keyof TrombeInputs, value: number | string) => {
    onInputChange({
      ...inputs,
      [field]: typeof value === 'string' ? value : value,
    });
  };

  const compactControls = (
    <>
      <SelectField
        label="Wall material"
        value={inputs.material}
        onChange={(v) => handleChange('material', v)}
        options={MATERIAL_OPTIONS}
        helper="Choose the thermal mass for the live demo."
      />
      <InputField
        label="Wall thickness"
        unit="m"
        value={inputs.t_wall}
        onChange={(v) => handleChange('t_wall', v)}
        min={0.1}
        max={0.5}
        step={0.02}
        helper="Thicker walls store more heat and delay release."
      />
      <InputField
        label="Glazing area"
        unit="m²"
        value={inputs.A_glazing}
        onChange={(v) => handleChange('A_glazing', v)}
        min={1}
        max={30}
        step={0.5}
        helper="Bigger glazing collects more sun, but also changes facade balance."
      />
      <InputField
        label="Solar irradiation"
        unit="kWh/m²/day"
        value={inputs.H_solar_day}
        onChange={(v) => handleChange('H_solar_day', v)}
        min={0.5}
        max={6}
        step={0.2}
        helper="Winter sun reaching the south-facing surface."
      />
      <InputField
        label="Glazing U-value"
        unit="W/m²K"
        value={inputs.U_glass}
        onChange={(v) => handleChange('U_glass', v)}
        min={0.6}
        max={5.8}
        step={0.2}
        helper="Lower values mean less night heat loss."
      />
      <InputField
        label="Shading factor"
        unit=""
        value={inputs.shading_factor}
        onChange={(v) => handleChange('shading_factor', v)}
        min={0.2}
        max={1}
        step={0.05}
        helper="1.0 means unshaded; lower values reduce solar access."
      />
    </>
  );

  const baseMaterial = MATERIALS[inputs.material as keyof typeof MATERIALS];
  const effectiveMaterial = materialOverride ?? baseMaterial;

  return (
    <div className="h-full overflow-y-auto border-r border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-900">Design Inputs</h2>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        Adjust the design and climate assumptions. The core controls are kept near the top, and the full input set stays available below for concept tuning.
      </p>

      {compactControls}

      <div className="mb-8 mt-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
          Building / Room
        </h3>
        <InputField
          label="Floor area served"
          unit="m²"
          value={inputs.A_floor}
          onChange={(v) => handleChange('A_floor', v)}
          min={10}
          max={200}
          step={5}
          helper="Total floor area connected to this Trombe wall."
        />
        <InputField
          label="Indoor target temperature"
          unit="°C"
          value={inputs.T_inside}
          onChange={(v) => handleChange('T_inside', v)}
          min={16}
          max={24}
          step={1}
          helper="Desired room temperature."
        />
        <InputField
          label="Average winter outdoor temperature"
          unit="°C"
          value={inputs.T_outside}
          onChange={(v) => handleChange('T_outside', v)}
          min={-20}
          max={15}
          step={1}
          helper="Average temperature during winter."
        />
        <InputField
          label="Night period for heat loss"
          unit="h"
          value={inputs.night_hours}
          onChange={(v) => handleChange('night_hours', v)}
          min={6}
          max={18}
          step={1}
          helper="Hours of darkness when the wall loses heat."
        />
        <InputField
          label="Building envelope U-value"
          unit="W/m²K"
          value={inputs.U_building}
          onChange={(v) => handleChange('U_building', v)}
          min={0.15}
          max={1}
          step={0.01}
          helper="Simplified night-heating comparison assumption."
        />
        <InputField
          label="Envelope area"
          unit="m²"
          value={inputs.A_envelope}
          onChange={(v) => handleChange('A_envelope', v)}
          min={40}
          max={250}
          step={1}
          helper="Approximate heat-loss area used for the comparison."
        />
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
          Trombe Wall Geometry
        </h3>
        <InputField
          label="Air cavity depth"
          unit="m"
          value={inputs.air_gap}
          onChange={(v) => handleChange('air_gap', v)}
          min={0.04}
          max={0.2}
          step={0.01}
          helper="Space between glazing and wall."
        />
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
          Glazing Properties
        </h3>
        <InputField
          label="Solar transmittance"
          unit=""
          value={inputs.tau_glass}
          onChange={(v) => handleChange('tau_glass', v)}
          min={0.3}
          max={0.9}
          step={0.02}
          helper="How much solar radiation passes through."
        />
        <InputField
          label="Wall surface absorptance"
          unit=""
          value={inputs.alpha_abs}
          onChange={(v) => handleChange('alpha_abs', v)}
          min={0.5}
          max={0.98}
          step={0.02}
          helper="0.90 = dark surface; absorbs most solar radiation."
        />
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
          Wall material data
        </h3>
        <p className="mb-4 text-xs leading-relaxed text-slate-600">
          Override the selected material values for this session if you want to explore a custom wall.
        </p>
        {effectiveMaterial && (
          <MaterialDetail
            material={effectiveMaterial}
            onChange={(updatedMaterial) => onMaterialOverrideChange?.(updatedMaterial)}
          />
        )}
        {materialOverride && (
          <button
            type="button"
            onClick={() => onMaterialOverrideChange?.(undefined)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Reset to library material
          </button>
        )}
      </div>
    </div>
  );
};
