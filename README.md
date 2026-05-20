# Trombe Wall Calculator

A design tool for architecture students to estimate the basic performance of Trombe wall passive solar heating systems.

## Features

- **Interactive input panel** with sliders and dropdowns for easy parameter adjustment
- **Real-time calculations** using simplified schematic design formulas
- **Visual SVG section diagram** showing the Trombe wall cross-section with solar and heat flow
- **Comprehensive results display** with performance metrics, warnings, and educational context
- **Responsive design** that works seamlessly on desktop and mobile devices
- **Clean architectural aesthetic** with calm colors and ample whitespace
- **Zero dependencies** beyond React and TypeScript (no database, no backend)

## What is a Trombe Wall?

A Trombe wall is a passive solar heating system consisting of:
- A south-facing glazing layer
- An air cavity
- A thick thermal mass wall (usually concrete, brick, or earth)
- Interior room space

During the day, solar radiation passes through the glazing, is absorbed by the dark wall surface, and heats the thermal mass. As the wall warms, air circulation (thermosiphon effect) and radiation gradually transfer heat into the room. Due to the thermal time lag, peak heat release typically occurs 8-12 hours after peak solar gain, providing valuable heating during evening and early morning hours.

## Getting Started

### Prerequisites

- Node.js (version 16 or later)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd /path/to/NaturalComfortTrombeWallCalculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The app will automatically open in your default browser at `http://localhost:3000`.

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The compiled app will be in the `dist/` folder. You can preview the production build with:

```bash
npm run preview
```

## Project Structure

```
NaturalComfortTrombeWallCalculator/
├── src/
│   ├── components/
│   │   ├── InputPanel.tsx          # Left panel with design inputs
│   │   ├── ResultsPanel.tsx        # Right panel with results and warnings
│   │   └── TrombeVisualization.tsx # SVG section diagram
│   ├── types.ts                    # TypeScript interfaces
│   ├── constants.ts                # Material properties and assumptions
│   ├── calculations.ts             # Core calculation logic
│   ├── App.tsx                     # Main app component
│   ├── main.tsx                    # React entry point
│   └── index.css                   # Tailwind CSS and custom styles
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── README.md                       # This file
```

## Calculation Methodology

The calculator uses simplified schematic design formulas:

### Key Formulas

1. **Wall Area**: A_wall = A_glazing (by assumption)
2. **Wall Mass**: m_wall = ρ × A_wall × t_wall
3. **Heat Storage Capacity**: Q_storage = (m_wall × c_p × ΔT_wall) / 3600 [kWh]
4. **Solar Energy Absorbed**: Q_absorbed = H_solar × A_glazing × τ_glass × α_abs × shading × orientation
5. **Glazing Heat Loss**: Q_loss = U_glass × A_glazing × ΔT × night_hours / 1000 [kWh]
6. **Net Useful Heat**: Q_net = Q_absorbed × efficiency_factor - Q_loss [kWh/day]

### Design Assumptions

- Useful wall temperature rise: 10 K
- Efficiency factor: 0.5 (accounts for radiation, convection, and system inefficiencies)
- Heat loss only during night period

## Input Parameters

### Building / Room
- **Floor area**: 10–200 m² (default: 50 m²)
- **Indoor target temperature**: 16–24 °C (default: 20 °C)
- **Average winter outdoor temperature**: -20–15 °C (default: 0 °C)
- **Night period**: 6–18 hours (default: 12 h)

### Climate / Solar
- **Daily solar irradiation**: 0.5–6.0 kWh/m²/day (default: 3.0)
- **Orientation factor**: 0.4–1.0 (default: 1.0)
- **Shading factor**: 0.2–1.0 (default: 0.9)

### Trombe Wall Geometry
- **Glazing area**: 1–30 m² (default: 8 m²)
- **Wall thickness**: 0.10–0.50 m (default: 0.30 m)
- **Air cavity depth**: 0.04–0.20 m (default: 0.08 m)

### Material Options
1. **Concrete**: ρ = 2300 kg/m³, c_p = 0.84 kJ/kgK, k = 1.6 W/mK
2. **Brick**: ρ = 1800 kg/m³, c_p = 0.84 kJ/kgK, k = 0.8 W/mK
3. **Adobe / Earth**: ρ = 1700 kg/m³, c_p = 0.90 kJ/kgK, k = 0.7 W/mK
4. **Water Wall**: ρ = 1000 kg/m³, c_p = 4.18 kJ/kgK, k = 0.6 W/mK

### Glazing Properties
- **Solar transmittance**: 0.3–0.9 (default: 0.70)
- **U-value**: 0.6–5.8 W/m²K (default: 2.8 W/m²K, ~double glazing)
- **Wall surface absorptance**: 0.5–0.98 (default: 0.90, dark color)

## Output Metrics

### Primary Result
- **Net Useful Daily Heat**: Daily thermal energy available for heating after losses

### Secondary Results
- **Solar Heat Absorbed**: Total solar energy captured by the wall
- **Heat Loss Through Glazing**: Thermal energy lost during night period
- **Heat Storage Capacity**: Maximum daily energy storage in the wall
- **Wall Mass**: Total weight of thermal mass material
- **Glazing-to-Floor Ratio**: Trombe wall area relative to served floor space
- **Estimated Time Lag**: Expected delay between peak solar gain and peak heat release

## Design Feedback and Warnings

The calculator provides contextual design guidance:
- Heat loss warnings if Q_net ≤ 0
- Glazing ratio warnings (too high or too low)
- Shading and orientation impact warnings
- Material thickness recommendations
- Always-included reminder about summer shading and night control


## Technologies Used

- **React 18**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **SVG**: Vector graphics for visualization


## Educational Use

This calculator is designed for:
- Architecture students learning passive solar design
- Schematic design phase exploration
- Parameter sensitivity analysis
- Quick feasibility assessment

**Important**: This is a simplified design tool intended for early-stage schematic exploration. It should not replace:
- Detailed thermal simulation software
- Professional engineering consultation
- Code compliance analysis
- Detailed thermal comfort assessment

## Licensing

Educational tool for learning purposes.

**Last Updated**: May 2026
