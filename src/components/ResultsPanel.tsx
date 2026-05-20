// Results panel showing calculated outputs and grouped feedback

import React, { useMemo, useState } from 'react';
import { TrombeResults } from '../types';

interface ResultsPanelProps {
  results: TrombeResults;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  highlighted?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  caption,
  highlighted = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlighted
          ? 'border-slate-300 bg-gradient-to-br from-slate-50 to-white'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 mb-2">
        {label}
      </p>
      <div className="flex items-end gap-2 flex-wrap">
        <span className={`font-bold ${highlighted ? 'text-4xl text-slate-900' : 'text-2xl text-slate-900'}`}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-600 pb-1">{unit}</span>}
      </div>
      {caption && <p className="mt-2 text-xs leading-relaxed text-slate-600">{caption}</p>}
    </div>
  );
};

interface FeedbackToneProps {
  status: string;
}

const toneClasses: Record<string, string> = {
  good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  reduced: 'bg-amber-50 text-amber-800 border-amber-200',
  poor: 'bg-rose-50 text-rose-800 border-rose-200',
  insufficient: 'bg-rose-50 text-rose-800 border-rose-200',
  balanced: 'bg-sky-50 text-sky-800 border-sky-200',
  'heavy and slow': 'bg-slate-100 text-slate-800 border-slate-200',
  low: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  moderate: 'bg-amber-50 text-amber-800 border-amber-200',
  high: 'bg-rose-50 text-rose-800 border-rose-200',
  weak: 'bg-rose-50 text-rose-800 border-rose-200',
  strong: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const FeedbackTone: React.FC<FeedbackToneProps> = ({ status }) => {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${toneClasses[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  const [showMethod, setShowMethod] = useState(false);

  const feedbackGroups = useMemo(() => {
    return results.feedback.reduce<Record<string, typeof results.feedback>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }

      acc[item.category].push(item);
      return acc;
    }, {});
  }, [results.feedback]);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-stone-50 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Design Results
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Estimated performance under the current schematic assumptions.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm border border-slate-200">
          Simplified model
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-100/60">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 mb-2">
            Primary result
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-stretch">
            <div>
              <div className="text-sm text-slate-600">Estimated useful heat</div>
              <div className="mt-2 flex items-end gap-2 flex-wrap">
                <span className="text-4xl font-bold text-slate-900">
                  {results.Q_net.toFixed(1)}
                </span>
                <span className="text-sm text-slate-600 pb-1">kWh/day</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Simplified net contribution after glazing losses and cavity-depth adjustment.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <div className="text-sm text-slate-600">Night heating coverage</div>
              <div className="mt-2 flex items-end gap-2 flex-wrap">
                <span className="text-4xl font-bold text-slate-900">
                  {results.coverage_percent.toFixed(0)}
                </span>
                <span className="text-sm text-slate-600 pb-1">%</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-700">
                {results.feasibility_message}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 mb-3">
            Thermal Battery
          </p>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Charge"
              value={results.Q_absorbed.toFixed(1)}
              unit="kWh/day"
              caption="Sunlight absorbed by the wall."
            />
            <MetricCard
              label="Capacity"
              value={results.Q_storage_kWh.toFixed(1)}
              unit="kWh"
              caption="Heat stored in the thermal mass."
            />
            <MetricCard
              label="Losses"
              value={results.Q_loss.toFixed(1)}
              unit="kWh/night"
              caption="Heat leaking back through the glazing."
            />
            <MetricCard
              label="Useful output"
              value={results.Q_net.toFixed(1)}
              unit="kWh/day"
              caption="Estimated heat that reaches the room."
              highlighted
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <MetricCard
          label="Solar heat absorbed"
          value={results.Q_absorbed.toFixed(1)}
          unit="kWh/day"
          caption="Estimated solar charge reaching the wall surface."
        />
        <MetricCard
          label="Storage capacity"
          value={results.Q_storage_kWh.toFixed(1)}
          unit="kWh"
          caption="Simplified daily storage potential of the wall."
        />
        <MetricCard
          label="Heat loss through glazing"
          value={results.Q_loss.toFixed(1)}
          unit="kWh/night"
          caption="Night-time leakage through the glazing layer."
        />
        <MetricCard
          label="Wall mass"
          value={Math.round(results.m_wall / 10) * 10}
          unit="kg"
          caption="Thermal mass available to store solar energy."
        />
        <MetricCard
          label="Estimated time lag"
          value={results.time_lag_description}
          caption="Delay between solar collection and heat release."
        />
        <MetricCard
          label="Glazing-to-floor ratio"
          value={results.glazing_floor_ratio_percent.toFixed(1)}
          unit="%"
          caption="Useful for comparing the facade area to the room served."
        />
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 mb-4">
          Can it cover the night?
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            label="Night heating demand"
            value={results.Q_night_demand.toFixed(1)}
            unit="kWh/night"
            caption="Simplified envelope heat-loss demand."
          />
          <MetricCard
            label="Net Trombe contribution"
            value={results.Q_net.toFixed(1)}
            unit="kWh/day"
            caption="Estimated useful heat available from the wall."
          />
          <MetricCard
            label="Coverage"
            value={results.coverage_percent.toFixed(0)}
            unit="%"
            caption={results.feasibility_message}
            highlighted
          />
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
          <strong>Comparison note:</strong> This is a simplified early-design comparison, not a
          dynamic building simulation. It only contrasts the wall's estimated useful heat with a
          coarse night demand estimate.
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 mb-4">
          Design feedback
        </p>
        <div className="space-y-4">
          {Object.entries(feedbackGroups).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
                <FeedbackTone status={items[0].status} />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{items[0].explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          onClick={() => setShowMethod((current) => !current)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Method
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Collapsible explanation of the schematic formulas used here.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {showMethod ? 'Hide' : 'Show'}
          </span>
        </button>
        {showMethod && (
          <div className="mt-4 space-y-4 text-sm text-slate-700 leading-relaxed">
            <div>
              <p className="font-semibold text-slate-900 mb-1">Solar absorbed</p>
              <pre className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`Q_absorbed = H_solar_day × A_glazing × tau_glass × alpha_abs × shading_factor × orientation_factor`}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Storage</p>
              <pre className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`V_wall = A_wall × t_wall
m_wall = rho × V_wall
Q_storage = m_wall × c_p × ΔT_wall`}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Glazing loss</p>
              <pre className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`Q_loss = U_glass × A_glazing × ΔT_loss × night_hours / 1000`}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Net useful heat</p>
              <pre className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`Q_net = Q_absorbed × efficiency_factor - Q_loss`}
              </pre>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">Building night demand</p>
              <pre className="font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
{`P_loss = U_building × A_envelope × ΔT_loss
Q_night = P_loss × night_hours / 1000`}
              </pre>
            </div>
            <p className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
              This is an early-design method for concept comparison. It is schematic and not a
              dynamic simulation.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed">
        <p className="font-semibold text-slate-700 mb-1">Disclaimer</p>
        <p>
          This tool simplifies Trombe wall behavior. Real performance depends on hourly solar
          radiation, thermal diffusivity, ventilation, surface temperatures, occupant behavior,
          shading, airtightness, and building heat demand. Use it for early concept comparison only.
        </p>
      </div>
    </div>
  );
};
