// SVG visualization of Trombe wall section

import React from 'react';
import { TrombeInputs, TrombeResults } from '../types';

interface TrombeVisualizationProps {
  inputs: TrombeInputs;
  results: TrombeResults;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function makeArrowPoints(x1: number, y1: number, x2: number, y2: number, size: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const backX = x2 - Math.cos(angle) * size;
  const backY = y2 - Math.sin(angle) * size;
  const perpX = Math.cos(angle + Math.PI / 2) * (size * 0.45);
  const perpY = Math.sin(angle + Math.PI / 2) * (size * 0.45);

  return `${x2},${y2} ${backX + perpX},${backY + perpY} ${backX - perpX},${backY - perpY}`;
}

export const TrombeVisualization: React.FC<TrombeVisualizationProps> = ({
  inputs,
  results,
}) => {
  const svgWidth = 980;
  const svgHeight = 460;

  const marginX = 42;
  const marginY = 38;
  const sectionTop = 112;
  const sectionHeight = 190;
  const roomWidth = 150;
  const glazingThickness = 18;

  const maxAirGap = 0.2;
  const maxWallThickness = 0.5;
  const airGapWidth = 24 + (inputs.air_gap / maxAirGap) * 92;
  const wallWidth = 70 + (inputs.t_wall / maxWallThickness) * 146;
  const sectionLeft = 160;
  const glazingX = sectionLeft;
  const airX = glazingX + glazingThickness;
  const wallX = airX + airGapWidth;
  const roomX = wallX + wallWidth;

  const solarStrength = clamp(results.Q_absorbed / 16, 0, 1);
  const storageStrength = clamp(results.Q_storage_kWh / 15, 0, 1);
  const releaseStrength = results.Q_net > 0 ? clamp(results.Q_net / 4, 0, 1) : 0;
  const lossStrength = clamp(results.Q_loss / 8, 0, 1);
  const warningState = results.Q_net <= 0;

  const wallFill = `rgba(104, 77, 57, ${0.58 + storageStrength * 0.3})`;
  const wallAccent = warningState ? '#B45309' : '#6B5344';
  const glazingFill = warningState ? '#FCE8D5' : '#EDF7FB';
  const airFill = '#F9FAFB';
  const solarColor = '#EAB308';
  const releaseColor = warningState ? '#B45309' : '#B87333';
  const lossColor = '#D97706';

  const arrows = [0, 1, 2].map((index) => {
    const y = sectionTop - 8 + index * 24;
    const startX = 88 + index * 6;
    const endX = glazingX + glazingThickness / 2;
    const endY = y + 12;

    return {
      startX,
      startY: y,
      endX,
      endY,
    };
  });

  const releaseYPositions = [sectionTop + 54, sectionTop + 102, sectionTop + 150];
  const lossYPositions = [sectionTop + 74, sectionTop + 128];

  return (
    <div className="w-full rounded-3xl bg-white p-5 shadow-sm border border-warm-100">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-warm-700">
            Section diagram
          </p>
          <h3 className="mt-1 text-lg font-bold text-stone-900">Trombe wall energy flow</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-700">
          <span className="rounded-full bg-amber-50 px-3 py-1 border border-amber-200">solar gain</span>
          <span className="rounded-full bg-stone-100 px-3 py-1 border border-stone-200">thermal storage</span>
          <span className="rounded-full bg-orange-50 px-3 py-1 border border-orange-200">heat release to room</span>
          <span className="rounded-full bg-rose-50 px-3 py-1 border border-rose-200">night heat loss</span>
        </div>
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        role="img"
        aria-label="Proportional Trombe wall section diagram"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="diagramBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCFBF8" />
            <stop offset="100%" stopColor="#F5EFE7" />
          </linearGradient>
          <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="roomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" />
            <stop offset="100%" stopColor="#FFF1E3" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={svgWidth} height={svgHeight} rx={24} fill="url(#diagramBg)" />

        {/* Sun */}
        <g>
          <circle cx={72} cy={84} r={22} fill="url(#sunGradient)" opacity={0.98} />
          <circle cx={72} cy={84} r={13} fill="#FBBF24" opacity={0.95} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const radians = (angle * Math.PI) / 180;
            const x1 = 72 + Math.cos(radians) * 18;
            const y1 = 84 + Math.sin(radians) * 18;
            const x2 = 72 + Math.cos(radians) * 31;
            const y2 = 84 + Math.sin(radians) * 31;

            return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={2} opacity={0.55} />;
          })}
          <text x={72} y={123} textAnchor="middle" fontSize={11} fill="#92400E" fontWeight="700">
            sun
          </text>
        </g>

        {/* Background room field */}
        <rect x={roomX} y={sectionTop} width={roomWidth} height={sectionHeight} rx={18} fill="url(#roomGradient)" stroke="#F2C59B" strokeWidth={2} />
        <text x={roomX + roomWidth / 2} y={sectionTop + 28} textAnchor="middle" fontSize={12} fill="#9A3412" fontWeight="700">
          room
        </text>

        {/* Glazing */}
        <rect x={glazingX} y={sectionTop} width={glazingThickness} height={sectionHeight} rx={6} fill={glazingFill} stroke="#7BB5CE" strokeWidth={2.5} />
        <text x={glazingX + glazingThickness / 2} y={sectionTop + sectionHeight + 24} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="700">
          glazing
        </text>

        {/* Air gap */}
        <rect x={airX} y={sectionTop} width={airGapWidth} height={sectionHeight} rx={6} fill={airFill} stroke="#C9CDD2" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={airX + airGapWidth / 2} y={sectionTop + sectionHeight + 24} textAnchor="middle" fontSize={11} fill="#334155" fontWeight="700">
          air gap
        </text>

        {/* Thermal mass wall */}
        <rect x={wallX} y={sectionTop} width={wallWidth} height={sectionHeight} rx={10} fill={wallFill} stroke={wallAccent} strokeWidth={2.5} />
        <text x={wallX + wallWidth / 2} y={sectionTop + 28} textAnchor="middle" fontSize={12} fill="#FFF7ED" fontWeight="700">
          dark thermal mass wall
        </text>
        <text x={wallX + wallWidth / 2} y={sectionTop + 50} textAnchor="middle" fontSize={10} fill="#FFF7ED" opacity={0.9}>
          thermal storage
        </text>

        {/* Solar gain arrows */}
        <g opacity={0.32 + solarStrength * 0.68}>
          {arrows.map((arrow, index) => (
            <g key={index}>
              <line
                x1={arrow.startX}
                y1={arrow.startY}
                x2={arrow.endX - 4}
                y2={arrow.endY}
                stroke={solarColor}
                strokeWidth={2 + solarStrength * 3}
                strokeLinecap="round"
              />
              <polygon points={makeArrowPoints(arrow.startX, arrow.startY, arrow.endX, arrow.endY, 10)} fill={solarColor} />
            </g>
          ))}
          <text x={120} y={55} textAnchor="middle" fontSize={11} fill="#8A5A16" fontWeight="700">
            solar gain
          </text>
        </g>

        {/* Absorbed heat at wall surface */}
        <g opacity={0.4 + solarStrength * 0.6}>
          <line
            x1={wallX - 10}
            y1={sectionTop + 88}
            x2={wallX + 6}
            y2={sectionTop + 88}
            stroke="#D97706"
            strokeWidth={2 + solarStrength * 2.5}
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <text x={wallX + 16} y={sectionTop + 81} fontSize={10} fill="#B45309" fontWeight="700">
            absorbed at wall surface
          </text>
        </g>

        {/* Stored heat inside wall */}
        <g opacity={0.28 + storageStrength * 0.72}>
          <line
            x1={wallX + wallWidth * 0.18}
            y1={sectionTop + 118}
            x2={wallX + wallWidth * 0.72}
            y2={sectionTop + 118}
            stroke="#F59E0B"
            strokeWidth={2 + storageStrength * 2.5}
            strokeLinecap="round"
          />
          <line
            x1={wallX + wallWidth * 0.28}
            y1={sectionTop + 148}
            x2={wallX + wallWidth * 0.62}
            y2={sectionTop + 148}
            stroke="#F59E0B"
            strokeWidth={1.8 + storageStrength * 2}
            strokeLinecap="round"
          />
          <text x={wallX + wallWidth / 2} y={sectionTop + 112} textAnchor="middle" fontSize={10} fill="#92400E" fontWeight="700">
            stored heat
          </text>
        </g>

        {/* Heat release to room */}
        {results.Q_net > 0 && releaseStrength > 0.06 ? (
          <g opacity={0.28 + releaseStrength * 0.72}>
            {releaseYPositions.map((y, index) => {
              const startX = wallX + wallWidth - 4;
              const endX = roomX + 18;
              return (
                <g key={index}>
                  <line
                    x1={startX}
                    y1={y}
                    x2={endX}
                    y2={y - 1}
                    stroke={releaseColor}
                    strokeWidth={1.8 + releaseStrength * 3}
                    strokeLinecap="round"
                  />
                  <polygon points={makeArrowPoints(startX, y, endX, y - 1, 11)} fill={releaseColor} />
                </g>
              );
            })}
            <text x={roomX + 36} y={sectionTop + 80} textAnchor="start" fontSize={11} fill="#9A3412" fontWeight="700">
              heat release to room
            </text>
          </g>
        ) : (
          <g>
            <text x={roomX + 36} y={sectionTop + 80} textAnchor="start" fontSize={11} fill="#B91C1C" fontWeight="700">
              weak or no net heat release
            </text>
            <rect x={wallX - 8} y={sectionTop - 10} width={wallWidth + airGapWidth + glazingThickness + 16} height={sectionHeight + 20} fill="none" stroke="#DC2626" strokeWidth={1.8} rx={16} strokeDasharray="8 6" />
          </g>
        )}

        {/* Night heat loss */}
        <g opacity={0.25 + lossStrength * 0.75}>
          {lossYPositions.map((y, index) => {
            const startX = glazingX + glazingThickness - 3;
            const endX = glazingX - 38;
            return (
              <g key={index}>
                <line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y - 10}
                  stroke={lossColor}
                  strokeWidth={1.5 + lossStrength * 3}
                  strokeLinecap="round"
                  strokeDasharray="3 4"
                />
                <polygon points={makeArrowPoints(startX, y, endX, y - 10, 10)} fill={lossColor} />
              </g>
            );
          })}
          <text x={18} y={sectionTop + 86} fontSize={11} fill="#B45309" fontWeight="700">
            night heat loss
          </text>
        </g>

        {/* Dimension labels and scale */}
        <g>
          <line x1={glazingX} y1={88} x2={airX} y2={88} stroke="#64748B" strokeWidth={1.4} />
          <line x1={glazingX} y1={82} x2={glazingX} y2={94} stroke="#64748B" strokeWidth={1.4} />
          <line x1={airX} y1={82} x2={airX} y2={94} stroke="#64748B" strokeWidth={1.4} />
          <text x={(glazingX + airX) / 2} y={76} textAnchor="middle" fontSize={10} fill="#475569" fontWeight="700">
            glazing = 0.02 m
          </text>

          <line x1={airX} y1={70} x2={wallX} y2={70} stroke="#64748B" strokeWidth={1.4} />
          <line x1={wallX} y1={64} x2={wallX} y2={76} stroke="#64748B" strokeWidth={1.4} />
          <text x={(airX + wallX) / 2} y={58} textAnchor="middle" fontSize={10} fill="#475569" fontWeight="700">
            air gap {inputs.air_gap.toFixed(2)} m
          </text>

          <line x1={wallX} y1={58} x2={wallX + wallWidth} y2={58} stroke="#64748B" strokeWidth={1.4} />
          <line x1={wallX + wallWidth} y1={52} x2={wallX + wallWidth} y2={64} stroke="#64748B" strokeWidth={1.4} />
          <text x={wallX + wallWidth / 2} y={44} textAnchor="middle" fontSize={10} fill="#475569" fontWeight="700">
            wall thickness {inputs.t_wall.toFixed(2)} m
          </text>

          <line x1={roomX} y1={sectionTop + sectionHeight + 52} x2={roomX + roomWidth} y2={sectionTop + sectionHeight + 52} stroke="#94A3B8" strokeWidth={1.5} />
          <line x1={roomX} y1={sectionTop + sectionHeight + 46} x2={roomX} y2={sectionTop + sectionHeight + 58} stroke="#94A3B8" strokeWidth={1.5} />
          <line x1={roomX + roomWidth} y1={sectionTop + sectionHeight + 46} x2={roomX + roomWidth} y2={sectionTop + sectionHeight + 58} stroke="#94A3B8" strokeWidth={1.5} />
          <text x={roomX + roomWidth / 2} y={sectionTop + sectionHeight + 72} textAnchor="middle" fontSize={10} fill="#64748B">
            room side and heat-receiving zone
          </text>
        </g>

        {/* Timeline */}
        <g transform={`translate(${marginX}, ${svgHeight - marginY - 64})`}>
          <text x={0} y={0} fontSize={11} fill="#7C2D12" fontWeight="700">
            time lag
          </text>
          <line x1={0} y1={18} x2={svgWidth - marginX * 2} y2={18} stroke="#D6C3B6" strokeWidth={3} strokeLinecap="round" />
          {[0, 1, 2, 3].map((segment) => {
            const labels = ['Morning', 'Noon', 'Evening', 'Night'];
            const x = ((svgWidth - marginX * 2) / 3) * segment;
            return (
              <g key={labels[segment]}>
                <circle cx={x} cy={18} r={5} fill="#A16207" />
                <text x={x} y={41} textAnchor="middle" fontSize={10} fill="#374151" fontWeight="600">
                  {labels[segment]}
                </text>
              </g>
            );
          })}
          <rect
            x={(svgWidth - marginX * 2) * 0.14}
            y={8}
            width={(svgWidth - marginX * 2) * 0.34}
            height={20}
            rx={10}
            fill="#FDE68A"
            opacity={0.7}
          />
          <text x={(svgWidth - marginX * 2) * 0.31} y={22} textAnchor="middle" fontSize={10} fill="#7C2D12" fontWeight="700">
            solar collection
          </text>

          <rect
            x={(svgWidth - marginX * 2) * 0.42}
            y={8}
            width={(svgWidth - marginX * 2) * 0.34}
            height={20}
            rx={10}
            fill="#FDBA74"
            opacity={0.7}
          />
          <text x={(svgWidth - marginX * 2) * 0.59} y={22} textAnchor="middle" fontSize={10} fill="#7C2D12" fontWeight="700">
            thermal storage
          </text>

          <rect
            x={(svgWidth - marginX * 2) * 0.68}
            y={8}
            width={(svgWidth - marginX * 2) * 0.18}
            height={20}
            rx={10}
            fill={warningState ? '#FED7AA' : '#FB923C'}
            opacity={warningState ? 0.45 : 0.7}
          />
          <text x={(svgWidth - marginX * 2) * 0.77} y={22} textAnchor="middle" fontSize={10} fill="#7C2D12" fontWeight="700">
            {warningState ? 'reduced release' : 'heat release'}
          </text>
        </g>

        <text x={marginX} y={svgHeight - 18} fontSize={10} fill="#6B7280" fontStyle="italic">
          Proportions are scaled to the selected wall thickness and cavity depth, with a schematic room zone for context.
        </text>
      </svg>
    </div>
  );
};
