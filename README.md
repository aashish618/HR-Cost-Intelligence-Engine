# HR Cost Intelligence Engine (AI Hackathon 2025)

Know what your meetings are costing you — in real time. An AI-powered intelligence platform that attributes corporate calendar syncs to project streams, computes real-time employee hourly burn rates, and flags cost leakage anomalies.

---

## ▌ Overview
In most organisations today, employee calendars are packed with meetings. Yet no system connects this meeting activity back to project budgets or HR expenditure.

The **HR Cost Intelligence Engine** bridges this gap by automatically parsing meeting contexts (titles, descriptions, attendee seniority, and collaboration recurrence) to compute expenditure and assign it to project budgets.

---

## ▌ Key Features

### 1. Project Cost Dashboard
- **Executive KPIs**: Real-time tracked Meeting Cost, total Person Hours, AI Attribution accuracy rate, and active Anomaly counts.
- **Project Allocation Chart**: An interactive SVG Donut chart displaying the precise cost share of each project stream (e.g. *Project Polaris*, *Project Zenith*) with custom hover states and neon borders.
- **Meeting Spend Trends**: An animated bezier area chart plotting daily organization-wide expenditures.
- **Department Cost Share**: Bar lists tracking meeting spend by designation (e.g. Developer, PM, Architect).

### 2. Calendar Sync Integration
- **Platform Simulators**: Connects via OAuth simulation interfaces to Google Calendar and Microsoft Outlook 365, syncing new event logs dynamically.
- **Custom Ledger Upload**: Accepts direct drag-and-drop ingestion of standard JSON or CSV calendar dumps (columns: Title, Description, Attendees, Duration) to run real-time parsing.
- **Human-in-the-Loop Override**: Features interactive dropdown menus allowing admins to manually re-attribute any meeting to another project, instantly recalculating budgets.

### 3. Dual-Mode AI Project Attribution
- **Local Heuristics Engine (Offline)**: Computes a multi-factor score matching titles/descriptions against project codes and keywords, combined with participant team allocations, producing confidence ratings (High / Mid / Low).
- **Live Gemini AI Integration**: Toggles on a real Gemini zero-shot model once a Google Gemini API Key is saved in Settings, allowing true LLM-based categorization and detailed reasoning text generation.

### 4. Designation & Cost Mapping
- **Salary Band Configurations**: Easily configure estimated hourly rates per corporate role (e.g., Senior Software Engineer at $120/hr, Principal Architect at $175/hr). Adjusting rates retroactively recalculates costs across all syncs.
- **Admin Access Control & Data Privacy**: Obscures individual salary details with a PIN lock screen (`1234` by default) in compliance with organizational privacy guidelines. Normal views only show role bands, while Admin Mode reveals exact rates.

### 5. Anomaly Detection & Insights
Scans meetings and budgets dynamically to flag operational anomalies:
- **Budget Overruns**: Alerts when project costs exceed assigned limits.
- **Low Confidence Mappings**: Flags ambiguous meetings (confidence < 50%) for admin review.
- **Ghost Meetings**: Identifies single-attendee sync blocks that could leak time.
- **Employee Burnout**: Flags employees spending > 20 hours a week in syncs.
- **High Cost / Low Priority**: Identifies expensive sessions (costs > $400) containing casual titles (e.g., "coffee", "chat").

---

## ▌ Tech Stack & Architecture
- **Frontend library**: React 18+ (SPA) with TypeScript 5+.
- **Build tool**: Vite.
- **Styling**: Modern Vanilla CSS, implementing glassmorphism, responsive grids, HSL layout tokens, neon alerts, and micro-animations.
- **Icons**: Lucide React.
- **Persistence**: Browser `localStorage` service to maintain state across page refreshes.

---

## ▌ Project Structure
- `src/types.ts`: TypeScript data models and interfaces.
- `src/mockData.ts`: Seeds the system with 10 employees, 6 projects, and 18 calendar meetings spread across 30 days.
- `src/index.css`: Core design system, variables, layouts, and animations.
- `src/App.tsx`: Central coordinator managing active tabs, syncs, resets, and global states.
- `src/services/`
  - `storageService.ts`: Reads/writes cache arrays to `localStorage`.
  - `aiService.ts`: Dual-mode categorizer (Heuristics rules + live Gemini API connector).
- `src/components/`
  - `Sidebar.tsx`: Navigation sidebar with Admin PIN validation overlay.
  - `Header.tsx`: Context header, time selectors, active AI engine badges, and sync buttons.
  - `DashboardOverview.tsx`: Graphical analytics cards, SVG donut slice rotators, and trend graphs.
  - `CalendarSync.tsx`: Importers, file upload drop zones, ledgers, and attribution selectors.
  - `EmployeeMapping.tsx`: Role bands and hourly rates sliders.
  - `ProjectBudgets.tsx`: Billable progress meters and priority ratings.
  - `AnomalyCenter.tsx`: Real-time scan warnings with ignore actions.
  - `Settings.tsx`: Key inputs and system reset logs console.

---

## ▌ Running Locally

### Prerequisites
Make sure you have Node.js (v18+) installed on your machine.

### Setup Instructions
1. Install node dependencies:
   ```bash
   npm install
   ```
2. Launch the local development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## ▌ Hackathon Evaluation Steps
1. **Explore Dashboard**: View the pre-seeded metrics, hover over the SVG donut chart segments, and check the daily trend line tooltip.
2. **Audit Calendar Sync**: Click "Sync Calendar" in the header to mock OAuth connections (ingests 2 new meetings).
3. **Trigger Manual Override**: Change a meeting's attribution to another project via the dropdown. Return to the Dashboard to see budgets instantly adjust.
4. **Test Importer**: Try uploading a custom JSON or CSV calendar file using the file selector.
5. **Adjust Hourly Rates**: Toggle "Enable Admin" in the sidebar, input `1234`, and change the rates under "Cost Mapping". Watch total project spends recalculate dynamically.
6. **Trigger Anomalies**: Decrease a project's budget in the "Project Budgets" tab, or assign multiple high-cost developers to a meeting. Go to "Anomaly Center" to view the newly detected alert.
7. **Activate Live Gemini AI**: Enter your Gemini API Key in the "Settings" tab. Recalculate any meeting to see Gemini parse the context.
