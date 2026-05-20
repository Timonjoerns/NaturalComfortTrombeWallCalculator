import React from 'react';
import { Material } from '../types';

interface MaterialDetailProps {
  material: Material;
  onChange: (updated: Material) => void;
}

export const MaterialDetail: React.FC<MaterialDetailProps> = ({
  material,
  onChange,
}) => {
  const handleNum = (key: keyof Material, value: number) => {
    const updated = { ...material, [key]: value } as Material;
    onChange(updated);
  };

  const handleThickness = (index: number, value: number) => {
    const tr = [...material.thicknessRange];
    tr[index] = value;
    onChange({ ...material, thicknessRange: [tr[0], tr[1]] });
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-2 text-sm font-semibold text-slate-800">Material details</h4>
      <div className="mb-3 text-sm text-slate-600">Editing: {material.name}</div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-slate-600">Density (rho) kg/m³</label>
        <input
          type="number"
          value={material.rho}
          onChange={(e) => handleNum('rho', parseFloat(e.target.value || '0'))}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        />

        <label className="text-xs text-slate-600">Specific heat (c_p) kJ/kgK</label>
        <input
          type="number"
          value={material.c_p}
          onChange={(e) => handleNum('c_p', parseFloat(e.target.value || '0'))}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        />

        <label className="text-xs text-slate-600">Conductivity (k) W/mK</label>
        <input
          type="number"
          value={material.k}
          onChange={(e) => handleNum('k', parseFloat(e.target.value || '0'))}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        />

        <label className="text-xs text-slate-600">Thickness min (m)</label>
        <input
          type="number"
          value={material.thicknessRange[0]}
          step={0.01}
          onChange={(e) => handleThickness(0, parseFloat(e.target.value || '0'))}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        />

        <label className="text-xs text-slate-600">Thickness max (m)</label>
        <input
          type="number"
          value={material.thicknessRange[1]}
          step={0.01}
          onChange={(e) => handleThickness(1, parseFloat(e.target.value || '0'))}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        />

        <div className="col-span-2 mt-2 text-xs text-slate-500">
          Changes apply immediately to calculations for this session only.
        </div>
      </div>
    </div>
  );
};
