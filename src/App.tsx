// Main App component

import { useMemo, useState } from 'react';
import { calculateTrombeWallWithMaterialOverride, getScenarioPreset } from './calculations';
import { MATERIALS } from './constants';
import { Material, TrombeInputs, TrombeResults } from './types';
import { InputPanel } from './components/InputPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { TrombeVisualization } from './components/TrombeVisualization';

const DEFAULT_INPUTS: TrombeInputs = {
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

const scenarioButtons = [
  getScenarioPreset('baseline'),
  getScenarioPreset('thinWall'),
  getScenarioPreset('poorSolar'),
  getScenarioPreset('highLoss'),
];

function buildDesignSummary(inputs: TrombeInputs, results: TrombeResults): string {
  const materialName = MATERIALS[inputs.material as keyof typeof MATERIALS]?.name ?? inputs.material;

  return [
    'Trombe Wall Design Summary:',
    `Material: ${materialName}`,
    `Wall thickness: ${inputs.t_wall.toFixed(2)} m`,
    `Glazing area: ${inputs.A_glazing.toFixed(1)} m²`,
    `Estimated absorbed solar heat: ${results.Q_absorbed.toFixed(1)} kWh/day`,
    `Estimated storage capacity: ${results.Q_storage_kWh.toFixed(1)} kWh`,
    `Estimated glazing heat loss: ${results.Q_loss.toFixed(1)} kWh/night`,
    `Estimated net useful heat: ${results.Q_net.toFixed(1)} kWh/day`,
    `Night heating coverage: ${results.coverage_percent.toFixed(0)}%`,
    `Time lag: ${results.time_lag_description}.`,
    'Note: simplified schematic-design estimate.',
  ].join('\n');
}

function App() {
  const [inputs, setInputs] = useState<TrombeInputs>(DEFAULT_INPUTS);
  const [materialOverride, setMaterialOverride] = useState<Material | undefined>(undefined);
  const [scenarioLabel, setScenarioLabel] = useState('Baseline');
  const [scenarioDescription, setScenarioDescription] = useState(
    'Balanced wall thickness and good solar access.'
  );
  const [copyLabel, setCopyLabel] = useState('Copy design summary');

  const results: TrombeResults = useMemo(() => {
    return calculateTrombeWallWithMaterialOverride(inputs, materialOverride);
  }, [inputs, materialOverride]);

  const handleInputChange = (updatedInputs: TrombeInputs) => {
    setInputs(updatedInputs);
    setMaterialOverride(undefined);
    setScenarioLabel('Custom');
    setScenarioDescription('Live custom adjustments.');
  };

  const applyScenario = (scenarioName: string) => {
    const preset = getScenarioPreset(scenarioName);
    setInputs(preset.inputs);
    setScenarioLabel(preset.label);
    setScenarioDescription(preset.description);
  };

  const handleCopySummary = async () => {
    const summary = buildDesignSummary(inputs, results);

    try {
      await navigator.clipboard.writeText(summary);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel('Copy design summary'), 1400);
    } catch {
      setCopyLabel('Copy failed');
      window.setTimeout(() => setCopyLabel('Copy design summary'), 1400);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fafaf9,_#f1f5f9_52%,_#e7edf4_100%)] text-slate-900">
      <header className="border-b border-slate-200 bg-slate-950 text-white shadow-[0_10px_40px_rgba(15,23,42,0.18)]">
        <div className="mx-auto max-w-7xl px-6 py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Trombe Wall Calculator
              </h1>
            </div>
            <button
              type="button"
              onClick={handleCopySummary}
              className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {copyLabel}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 lg:py-8">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                Scenario presets
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {scenarioButtons.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyScenario(preset.name)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  >
                    <div className="text-sm font-semibold text-slate-900">{preset.label}</div>
                    <div className="mt-1 max-w-xs text-xs leading-relaxed text-slate-600">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              <div className="font-semibold text-slate-900">{scenarioLabel}</div>
              <div className="mt-1 max-w-md leading-relaxed">{scenarioDescription}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <InputPanel
              inputs={inputs}
              onInputChange={handleInputChange}
              materialOverride={materialOverride}
              onMaterialOverrideChange={setMaterialOverride}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <TrombeVisualization inputs={inputs} results={results} />
            </div>

            <div className="rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <ResultsPanel results={results} />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 py-5">
        <div className="mx-auto max-w-7xl px-6 text-xs leading-relaxed text-slate-600">
          <p>
            Trombe Wall Calculator • educational early-design demo for architecture presentations.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
