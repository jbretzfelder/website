# AGENTS.md — Bretzfelder Website Repository Instructions

This is the primary instruction file for AI coding agents working in this repository.

## Repository Scope

This repository contains two production web applications:

1. **DocAssist** — a clinical documentation tool.
2. **Clinical Training / Training** — an interactive staff training application.

Treat the two applications as **independent codebases unless the repository itself proves otherwise**. They may cross-link in the user interface, but they do not share application state, JavaScript logic, or localStorage data.

## First Rule: Identify Which Application You Are Editing

Before changing code:

1. Inspect the repository tree.
2. Identify the exact file/directory that serves **DocAssist** and the exact file/directory that serves **Training**.
3. Read the relevant application section of this `AGENTS.md`.
4. Do not assume an unverified path, deployment arrangement, or shared dependency.
5. Make the smallest targeted change necessary.
6. Do not modify the other application unless the request explicitly requires it.
7. Review the diff and test the affected workflow before reporting completion.

## Repository-Wide Safety Rules

- This is production software. Preserve working behavior unless a change is explicitly requested.
- Do not refactor unrelated code for style or cleanliness.
- Do not remove existing functionality to simplify a new change.
- Never commit passwords, API keys, access tokens, secrets, PHI, or real client/patient information.
- Do not add analytics, tracking, external data transmission, authentication, or third-party services without explicit approval.
- Preserve each application's localStorage behavior unless explicitly asked to change it.
- When a requirement affects clinical logic, generated documentation, billing/compliance behavior, or a production workflow, do not guess.
- Verify the repository structure and actual code before relying on assumptions contained in historical project notes.
- Report only tests that were actually performed.

---

# Part I — DocAssist

The following section preserves the existing DocAssist development instructions.

## 1. Project Overview

DocAssist is a single-file clinical documentation tool (HTML/CSS/JS) for Woodhaven, a residential addiction treatment facility in Ohio. It is designed to reduce documentation burden on counselors and clinical staff while producing documentation that survives Medicaid payer review and maps correctly to Remarkable (the facility's desktop EHR).

The tool serves:
- Clinical staff (counselors, therapists)
- Nursing staff
- Supervisors

Joseph Bretzfelder, Clinical Director at Woodhaven, owns the product and makes all clinical/workflow decisions. He has deep expertise in ASAM criteria, Ohio LOC designations, Medicaid billing compliance, and addiction treatment. All generated language, calculations, and required fields are treated as production-critical clinical work.

## 2. Architecture

### File Structure
- **Single HTML file** (~14,600 lines)
- **Inline CSS** within `<style>` tags (two separate style blocks)
- **Inline JavaScript** within `<script>` tag
- **No external libraries or build system**
- **Hosted on GitHub Pages** at bretzfelder.com/docassist
- **Fonts**: IBM Plex Sans (weights 400, 500, 600, 700) and IBM Plex Mono via Google Fonts
- **Color scheme**: Forest green palette (`--accent: #2d6a4f`, others defined in `:root`)

### Top-Level Structure
```
<html>
  <head> → Meta, fonts, first <style> block (main design system)
  <body>
    <div class="header"> → Always visible (title, timer, reset, feedback buttons)
    <div class="container">
      <div id="view-home"> (active on load)
      <div id="view-asam">
      <div id="view-itp">
      <div id="view-note">
      <div id="view-group">
      <div id="view-discharge">
      <div id="view-discharge-email">
      <div id="view-nn"> (Nursing Note)
      <div id="view-asa"> (ASA Intervention Note)
      <div id="view-productivity">
    </div>
    <div id="footer"> → Autosave indicator
    <second <style> block> (Group Note layout overrides)
    <script> → All application logic
  </body>
</html>
```

### Major State Objects (Global)

```javascript
const state = {}                  // ASAM Documentation — dimensions 1-6 with all fields
const itpSelected = {}            // ITP Development — selected categories per section (A, B, C)
const snState = {}                // Individual Session Note
let dsState = {}                  // Discharge Summary
let deState = {}                  // Discharge Email
const nnState = {}                // Nursing Note
let asaState = {}                 // ASA Intervention Note
let pcCounselors = []             // Productivity Calculator — array of counselor objects
let pcNextId = 1                  // Productivity Calculator — next counselor ID
```

All state persists in memory while navigating between views. No data is lost when switching tools.

## 3. Major Application Components

### Home Screen (`view-home`)
Gateway to all tools. Displays:
- **Discharge Email** (prominent card at top, marked "★ All Staff")
- **Clinical Documentation section**: ASAM, ITP, Individual Note, Group Notes, ASA Intervention, Discharge Summary
- **Nursing section**: Nursing Note
- **Supervisor Tools section**: Productivity Calculator
- **Bottom links**: "How to Use" (tutorial), "What's New" (changelog modal), "Clinical Training" (link to bretzfelder.com/training)

Easter egg: clicking the DocAssist logo 3 times in 2 seconds loads the sample client "Marcus" across all tools for testing.

### Header (Always Visible)
- Title and "Built by Joseph" subtitle
- **Session Timer**: Play/Stop/Reset buttons; shows start time, end time, elapsed duration
- **↺ Reset Button**: Opens confirmation modal; clears all data across all tools and autosave recovery (intentional)
- **Feedback Button**: Displays mailto link to joseph.bretzfelder@woodhavenohio.com
- **Autosave Indicator** (bottom-right corner): "Saved" / error state; fades out after 2.5s

### Tool 1: ASAM Documentation (`view-asam`)
Produces Medicaid-compliant clinical documentation across 6 ASAM dimensions. Designed for payer review.

**Left Panel — Inputs**:
- Toolbar: LOC selector (1.0, 2.1, 2.5, 3.5, 3.7, 3.7WM), document type toggle (Initial / Continued Stay), client first name, date
- Dimension tabs (1–6): each has severity pills, structured fields, checkboxes (symptoms, triggers, risks), free-text fields
- Challenge messages (amber warnings) appear when counselors select positive values (good insight, low risk, supportive environment, etc.) to prevent generic documentation
- CIWA-Ar/COWS fields and withdrawal symptoms only visible at LOC 3.7WM; managed by `updateLocFields()` hook
- Primary Driver badges mark which dimensions matter for the selected LOC; those fields are required

**Right Panel — Two Tabs**:
- **Tab 1: ASAM Narrative** — generated documentation with Copy button per dimension and bulk Copy Narrative button
- **Tab 2: Criteria & Risk Ratings** — auto-suggested dimensional risk scores (0–4, color-coded, adjustable), Remarkable criteria checklist with Copy Summary button

**Generate Bar** (fixed bottom): validation before generation; flags missing required fields with red borders and jump-to-field error list.

### Tool 2: ITP Development (`view-itp`)
Standalone tool. No dependency on ASAM output.

**ASAM Goals Reference** (collapsible): pulls continued-stay goal fields from ASAM if present; auto-opens when content exists, so counselors can verify alignment.

**Three Sections (A, B, C)**:
- Section A = ASAM Dimensions 1 & 2
- Section B = ASAM Dimensions 3 & 4
- Section C = ASAM Dimensions 5 & 6

**Per section**:
- Dropdown to select categories (29 total across all sections; letters restart per section)
- Selected categories render as removable chips
- Each category expands to show:
  - Template goal (dropdown to select from Wiley Treatment Planner)
  - SMART reminder pills (Specific, Measurable, Achievable, Relevant, Time-bound)
  - Editable goal textarea (amber border if unedited; clears when modified)
  - Objective/intervention pairs (checkboxes, default unchecked, opt-in)

**Format for ITP Button** (sticky at bottom): validates goals; warns if any goal still has template language (SMART warning); generates formatted output in copy-able boxes per Remarkable field structure (separate boxes for Goals, Objectives, Interventions).

### Tool 3: Individual Session Note (`view-note`)
Two-column layout: inputs left, live preview right. All output uses "this clinician" language (never first person).

**Session Types**:
- Individual — Working off ITP (Reviewing) [default]
- Individual — Updating / Revising ITP
- Individual — First Meeting / Initial ITP
- Crisis Intervention

(First Meeting hides Goal Reviewed/Objective Completed rows; Crisis hides all ITP reference fields.)

**Inputs**: client name, date, session type, behavioral scale (1–10 clickable pills, color-coded), ITP reference fields (goal letter/objective reviewed, goal letter/objective assigned next, completed checkbox), intervention checkboxes (Motivational Interviewing, CBT — selected but not included in output), Session Description textarea, Response/Progress textarea, Risk/Safety section.

**Output** (two separate Remarkable fields, each with Copy button):
1. **Describe Therapeutic Interventions Provided** — boilerplate + session description + assigned objective
2. **Response — Intervention/Progress/Clinical Judgement** — completed objective line + scale rating + progress narrative + next objective + risk/safety

Each line starts with `- `.

### Tool 4: Group Notes (`view-group`)
Left setup panel (session date, counselor name, client ratio, activity/technique checkboxes); right client response panel.

- Client slots auto-populate from ratio entry
- Shared intervention displayed once in dark green block ("copy once for all clients")
- Individual client response cards with prognosis pills (Poor/Fair/Good); Good prognosis triggers amber billing warning
- Ratios >12:1 trigger non-billable warning
- Output designed for linear top-to-bottom copy workflow to Remarkable
- Sample data loader exists for testing

### Tool 5: Discharge Summary (`view-discharge`)
Comprehensive discharge documentation.

**Inputs**: client name, admission date, last contact date, discharge type/subtype, admission LOC, phases of treatment, status/observations, clinical judgment on success, skills acquired, step-down location, transition plan, aftercare elements, resource sheet, referrals.

**State object** (`dsState`): uses `.skills`, `.aftercareElements`, `.referrals` as Sets (require mutation in place, not reassignment).

**Calculations**: auto-calculates days in treatment from admission/last contact dates; calculates dosage hours based on LOC.

**Output**: structured sections (days in treatment, phases, clinical observations, skills, aftercare, referrals, resource sheet).

### Tool 6: Discharge Email (`view-discharge-email`)
Email generation for discharge communication.

**Inputs**: recipient address (defaults to discharge@woodhavenohio.com), client name, discharge date, discharge type, staff involvement, probation status, outpatient referral section, "Why Not?" conditional fields.

**State object** (`deState`): all fields stored.

**Validation**: required field validation with red error panel and jump-to-field links; blocks generation with error messages.

**Output**: pre-formatted email text ready to send.

### Tool 7: Nursing Note (`view-nn`)
Nursing progress documentation.

**Inputs**: client name, date, vital signs (BP, HR, temp, RR, O2), symptom checkboxes (pain, nausea, fatigue, etc.), Mental Status Exam (MSE) chips, physical observations, medications, stability assessment, psychiatric symptoms, nurse progress narrative, action/plan textarea.

**State object** (`nnState`): all fields stored; includes arrays for symptoms, MSE, observations, medications, psychiatric symptoms.

**Critical pattern**: `nnBuildAllChips()` must be called on fresh page load (in DOMContentLoaded) AND during autosave restore, otherwise accordion sections render empty (this was a silent initialization bug).

**Output**: structured nursing narrative in a single Remarkable field.

### Tool 8: ASA Intervention Note (`view-asa`)
Alcohol Substance Abuse (ASA) intervention documentation for specific behavioral/substance use events.

**Inputs**: client name, date, event type (using substance, intoxicated, behavioral incident, etc.), context, intervention provided, client response, staff involvement, outcome/clinical judgment.

**State object** (`asaState`).

**Output**: structured intervention narrative.

### Tool 9: Productivity Calculator (`view-productivity`)
Supervisor tool for tracking counselor/staff billable hours, productivity percentages, and time allocation.

**Data structure**: `pcCounselors[]` array; each counselor has:
```javascript
{
  id: number,
  name: string,
  type: 'res' | 'php' | 'op',        // residential, partial hospitalization, outpatient
  period: 'weekly' | 'monthly',
  isOpen: boolean,                   // accordion state
  totalHrs, code1, code2, time1, time2, pto,  // for weekly entry
  c400, c400t, c402, c402t, c403, c404, c404t,  // billing codes + time
  noShow, timeGroup, daysWorked, hoursPerDay,   // for monthly entry
  ranTelehealthGroups, ran61RSGGroups           // conditional flags
}
```

**Persistence**: stored in localStorage under `PC_STORAGE_KEY = 'docassist_productivity_v1'`.

**Productivity calculation**: (Days Worked × Hours Per Day − PTO) ÷ target%; targets are Residential 65%, PHP 80%, OP 75%.

**Type-specific defaults**: PHP defaults to 5 days/8 hours, OP defaults to 4 days/10 hours.

**Known bugs** (as of last memory):
- 61RSG toggle not functioning correctly (fields always visible instead of conditionally shown)
- PTO not factoring into residential monthly productivity percentage
- Copy-to-week feature in progress

---

## 4. Data Flow and Dependencies

### ASAM → ITP
**Direction**: One-way, initial; not bidirectional.
- ITP tool has collapsible "ASAM Goals Reference" that reads `state.dim3.csGoals`, `state.dim4.csGoals`, `state.dim5.csProgress`, `state.dim6.csProgress` from ASAM continued-stay mode
- These fields only populate when:
  - ASAM `admissionType === 'continued'`
  - User enters continued-stay-specific data
- ITP does not write back to ASAM

### Discharge Summary ↔ Discharge Email
**Direction**: Independent.
- Discharge Summary and Discharge Email are separate workflows
- Discharge Summary does NOT pre-populate to Discharge Email
- Each tool collects its own client/discharge information

### Autosave Across All Tools
**Scope**: ASAM, ITP, Individual Note, Group Notes, Discharge Summary, Discharge Email, Nursing Note, ASA Intervention, Productivity Calculator (all 9 tools).

**Recovery**: On page load, if autosave snapshot exists and is <8 hours old, user is prompted to restore. Restoring repopulates all tool states and DOM (checkboxes, textareas, pills, chips).

**Critical for recovery**: Autosave must rebuild chips, checkboxes, and visual elements via restore functions (`autosaveRestoreCheckboxGroup()`, `autosaveRestoreSeverityPills()`, etc.). Without these calls, DOM remains empty.

### Session Timer (Global)
Persists across all tool navigation. Tracks single session start/end/elapsed. Not tool-specific.

### Navigation
`navigateTo(view)` switches between tools; clears active view, sets new view active, triggers tool-specific setup if needed:
- `navigateTo('itp')` → calls `renderAsamRef()` (populates ASAM goals reference)
- `navigateTo('discharge')` → calls `dsInit()` (initializes Discharge Summary UI)
- `navigateTo('discharge-email')` → calls `deRenderOutput()` (renders email preview)
- `navigateTo('home')` → calls `updateHomeScrollHint()` (manages scroll hint visibility)

---

## 5. Clinical and Documentation Logic

### ASAM Dimensions and Required Fields
All 6 dimensions have structured fields designed to map to Remarkable fields. Each dimension has:
- **Severity** (pills: appropriate choices per dimension)
- **Primary Driver badge** (indicator that this dimension is critical for the selected LOC)
- **Required fields** (fields that must be filled before ASAM documentation generates; depends on LOC and admission type)
- **Continued Stay fields** (separate set of fields when `admissionType === 'continued'`; all are required in continued stay mode)

**LOC-Specific Logic**:
- LOC 3.7WM is the only level requiring CIWA-Ar/COWS scores and withdrawal assessment fields
- LOC 3.5, 3.7, others: withdrawal fields remain hidden
- Managed by `updateLocFields()` within `updateDimBadges()` hook

### Challenge Messages
Purpose: prevent generic, low-insight documentation that won't survive payer review.

Triggered when counselor selects positive values:
- Good insight
- Low relapse risk
- Supportive environment
- Low engagement barriers
- etc.

Challenge message appears below the pill group; warns counselor to ensure documentation is individualized (not generic template language).

**Implementation**: pills have `data-challenge-id` and `data-challenge-values` attributes; `setSeverity()` evaluates these and displays alerts.

### ASAM Narrative Generation
**Function**: `generate()`

1. **Validation**: checks all required fields are filled; flags missing fields with red borders and error list
2. **Generation**: builds narrative text per dimension using state values + templates
3. **Renders**: ASAM Narrative (Tab 1) and Criteria & Risk Ratings (Tab 2)

**Critical rule**: Generated narrative is production documentation for payer review. Clinical language, specificity, and logic must be preserved exactly. Do not alter generated text without explicit clinical request.

### Dimensional Risk Ratings (0–4)
Auto-suggested based on ASAM inputs; counselor can adjust. Each rating has plain-language description. Color-coded:
- 0 = no signs/symptoms (green)
- 1 = minimal (light green)
- 2 = moderate (yellow)
- 3 = considerable (orange)
- 4 = severe (red)

### Remarkable Criteria Checklist
Maps ASAM criteria letters to Remarkable field. Pre-checked based on dimension inputs. Counselor can adjust. Copy Summary button generates a text like `Dimension 4: b, c, e` for reference while working in Remarkable.

### ITP Goals (Wiley Treatment Planner)
ITP tool uses templates from Wiley Treatment Planner (66 objective/intervention pairs across 27 categories). Each goal template has:
- Goal statement (editable)
- Objectives (default unchecked, opt-in)
- Interventions (default unchecked, opt-in)

**SMART check**: on format, warns if any goal textarea still matches template language (means goal was not customized).

### Generated Content Language
- **"This clinician"** — used throughout Individual Note, Group Notes, Nursing Note, ASA Intervention (never first person)
- **"The client"** — gender-neutral throughout (never "he/she")
- **Omit-if-blank**: fields that are blank are not included in output

---

## 6. Generated Content

### ASAM Narrative (Tab 1)
**Structure per dimension**: 
- Short boilerplate introducing the dimension
- Severity statement + summarized input fields
- Relevant checkboxes/selections woven into narrative
- Free-text fields incorporated verbatim
- Continued-stay additions (status, progress, clinical direction)

**Copy behavior**: Each dimension has individual Copy button; also bulk Copy Narrative button.

**Output format**: Plain text, ready to paste into Remarkable.

### Criteria & Risk Ratings (Tab 2)
**Risk Ratings**: auto-suggested 0–4 scores with plain-language descriptions; color-coded.

**Criteria Checklist**: `Dimension N: a, b, d, ...` format (letters only); maps to Remarkable's structured criteria field.

### ITP Output
**Structure**: Per section (A, B, C), then per goal.
- Goal: formatted, reviewed for SMART
- Objectives: bulleted list, numbered per goal (1A, 2A, 3A, etc.)
- Interventions: bulleted list, numbered per objective (1A, 2A, 3A, etc.)

**Format**: Copy-able boxes per Remarkable field structure.

### Individual Session Note (Two Separate Outputs)
1. **Describe Therapeutic Interventions Provided**: boilerplate + session description + assigned objective line
2. **Response — Intervention/Progress/Clinical Judgement**: completed objective line + scale rating + progress narrative + next objective + risk/safety

Each line starts with `- `.

### Group Notes Output
- Shared intervention (shown once, labeled "copy once for all clients")
- Per-client response cards (one per client slot in ratio)
- Billing prognosis + warnings

### Discharge Summary Output
Sections: days in treatment, phases, status/observations, clinical judgment, skills, aftercare, referrals, resource sheet, next-level care instructions.

### Discharge Email
Pre-formatted email body with placeholder for recipient email address (defaults to discharge@woodhavenohio.com).

### Nursing Note Output
Single narrative field in Remarkable, structured as: intro + vital signs + symptoms + MSE + observations + medications + psychiatric assessment + plan/actions.

### ASA Intervention Output
Structured narrative: event type + context + intervention + client response + staff involvement + outcome.

---

## 7. Client Data

### Storage
All client data is stored in memory (global state objects). No remote database; no cloud sync.

### Persistence
- **Autosave** to localStorage (8-hour rolling expiry, scoped by tool)
- **Session timer** persists as long as the browser tab remains open
- **Productivity Calculator** uses separate localStorage key (`PC_STORAGE_KEY`)

### Recovery
**Autosave recovery**: On page load, if `AUTOSAVE_KEY` snapshot exists and is <8 hours old, user is prompted. On restore:
- All state objects re-populated from snapshot
- DOM rebuilt (checkboxes, chips, pills, textareas restored)
- Tool-specific restore functions called (e.g., `autosaveRestoreCheckboxGroup()`, `nnBuildAllChips()`)

### Sample Client (Marcus)
- Used for testing and tutorial demonstrations
- Loaded via `fillSampleClient()` when Easter egg triggered
- Fully populates all tools with realistic continued-stay scenario (3.5 residential continued stay)
- Used in tutorial overlays for step-by-step guidance

### Privacy
- **Real client information MUST NEVER be committed to source code, test data, documentation, or comments**
- DocAssist does not send data to external servers
- All client data stays in browser memory and local autosave storage (not synced to cloud)
- Facilities using DocAssist are responsible for clearing autosave recovery storage when clinical staff logs out (manual Reset button click)

---

## 8. Autosave, Recovery, and Persistence

### Autosave Mechanism
**Storage key**: `AUTOSAVE_KEY = 'docassist_autosave_v1'`

**Trigger**: on any input change across all tools; debounced by timer (not real-time, to avoid excessive writes).

**What's saved**:
- All state objects (state, snState, dsState, etc.)
- DOM snapshot (checkboxes checked status, textarea values, select values, pills state)
- Timestamp (for staleness check)

**Indicator**: "Saved" dot in bottom-right corner; fades out after 2.5s.

### Recovery
**On page load** (`DOMContentLoaded`):
1. Attempt to read `AUTOSAVE_KEY` from localStorage
2. If found, check staleness: `autosaveIsStale()` returns true if >8 hours old
3. If stale, discard and clear (`autosaveClear()`)
4. If fresh, show restore prompt modal with "Restore" and "Discard" buttons
5. On Restore:
   - Repopulate state objects
   - Call tool-specific restore functions (rebuild checkboxes, chips, pills, textareas)
   - Re-render outputs if applicable

**Critical**: without restore functions being called, DOM elements (checkboxes, chips) will be empty even though state is populated. This is a silent initialization failure.

### 8-Hour Expiry
Autosave snapshots older than 8 hours are discarded on next page load. No manual cleanup required.

### Autosave Indicator
- Shows "Saved" on successful save, fades to 50% opacity after 2.5s
- Shows error state if localStorage write fails (e.g., quota exceeded)
- Located in footer, always visible

### Reset and Autosave
**`doReset()` function**: clears all state objects AND autosave recovery data. Requires confirmation modal. Intentional — prevents accidental recovery of old data after client discharge.

### Productivity Calculator Persistence
Separate from ASAM autosave. Uses `PC_STORAGE_KEY` and `pcLoad()` / `pcSave()` functions. Counselor/productivity data is NOT part of ASAM autosave recovery.

---

## 9. UI/UX Conventions

### Color Palette
```
--bg: #f0f2f0                    (page background)
--surface: #ffffff               (cards, inputs)
--header: #0d1f13                (dark green header)
--accent: #2d6a4f                (forest green, primary)
--accent-light: #d4eadd          (light green, backgrounds)
--text: #1a201c                  (dark text)
--text-secondary: #6b7870        (secondary text)
--border: #dde1dc                (light border)
--border-focus: #2d6a4f          (focused border, green)
--output-bg: #f7faf8             (output text background)
--warning-bg: #fffbeb            (warning background, yellow)
--warning-border: #fcd34d        (warning border, yellow)
--warning-text: #92400e          (warning text, dark orange)
--continued-bg: #f0f7f2          (continued stay background, light green)
--continued-border: #b8d9c4      (continued stay border)
```

### Typography
- **Primary font**: IBM Plex Sans (400, 500, 600, 700)
- **Monospace**: IBM Plex Mono
- **Font sizing**: scales from 11px (small labels) to 18px (section headers)
- **Letter spacing**: 0.01em on many headers and labels for refinement

### Layout Patterns

**Two-column layout** (ASAM, Individual Note, Group Notes):
- Left panel: inputs, controls
- Right panel: preview/output
- `display: flex` with `min-height: 0` on panels to support scrolling
- Border-right divider between panels

**Toolbar pattern**:
- Sticky at top of tool view
- Padding: 16px; gap between elements
- Input/select controls aligned horizontally

**Generate bar** (ASAM, ITP, etc.):
- Fixed at bottom of tool
- Full-width button with centered text
- Includes validation message area above
- Semantic color (accent green or warning red)

**Card pattern** (home screen, Discharge Summary):
- `background: var(--surface)` with subtle border
- Padding: 16-20px
- Icon + title + description or action
- Hover state: slightly darker background, cursor: pointer

**Modal pattern**:
- `.modal-visible` class controls visibility
- Fade-in/fade-out animations (160ms)
- Centered, semi-transparent overlay
- Confirmation buttons aligned to right or center

### Pill/Toggle Pattern
- `.pill` class: inline-flex, padding 6-8px, border-radius 20px, cursor pointer
- Hover: background change, border change
- Active/selected: filled background (accent green), white text
- Severity pills: color-coded by value

### Checkbox Pattern
- Custom styled with `.checkbox-item` label
- Input hidden, label contains SVG or native checkbox
- Hover: lighter background
- Checked: filled with accent color

### Textarea/Input Pattern
- `.form-input`, `.form-textarea`, `.form-select`
- Border: 1px `var(--border)`, rounded 6px
- Focus: border changes to `var(--border-focus)` (green)
- Error state: red border
- Placeholder text in `var(--text-secondary)`

### Responsive Behavior
- **Desktop**: full two-column layout with left sidebar/right preview
- **Mobile (380px and below)**:
  - Single-column stack (inputs above output)
  - Panels expand full-width
  - Top toolbar remains sticky
  - Font sizes slightly reduced
  - Touch-friendly button/pill sizes (min 44px height)

### Accordion/Expand Pattern
- `.accordion` class with toggle button (+ or −)
- `max-height: 0` (closed) to `max-height: 999px` (open) with smooth transition
- Content revealed with slide-down animation

### Transition Conventions
- `.view-transitioning` class manages view swaps (fade + slight Y translate)
- `.modal-fade` / `.modal-visible` for modal animations
- `.pane-fade-init` for pane appearance
- All transitions ~160ms with cubic-bezier easing

### Cursor Affordances
- `cursor: pointer` on clickable elements (buttons, cards, pills, tabs)
- `cursor: text` on text inputs
- Default cursor on read-only text

### Mobile Tooltip Width
- CSS: `width: 380px` used in media queries
- JS: `Math.min(380, ...)` used for tooltip width calculations
- Critical for tutorial overlays (Popper.js-like positioning)

---

## 10. Production-Critical Behavior

The following functionality must be presumed intentional and must not be changed without explicit instruction:

1. **ASAM Required Field Validation**
   - Prevents generation if required fields are blank
   - Primary driver fields required based on LOC
   - All continued-stay fields required in continued stay mode
   - Red borders + error list on validation failure

2. **Challenge Messages**
   - Alert counselor when selecting positive values (good insight, low risk, etc.)
   - Prevent generic documentation
   - Tied to specific severity pill selections per dimension

3. **LOC-Specific Visibility** (3.7WM withdrawal fields)
   - CIWA-Ar/COWS fields only visible at LOC 3.7WM
   - Hidden for all other LOCs
   - Managed by `updateLocFields()` hook

4. **ITP Continued Goals Reference**
   - Collapsible panel that reads ASAM continued-stay goals if present
   - Auto-opens when content exists
   - Shows alignment between ASAM and ITP

5. **Individual Note Two-Output Structure**
   - Generates TWO separate copy-able blocks (not one)
   - First block: Interventions + session description + assigned objective
   - Second block: completed objective + scale + progress + next objective + risk/safety
   - Maps to two separate Remarkable fields

6. **"This Clinician" Language Throughout**
   - Never first-person ("I", "we")
   - Always third-person ("this clinician", "the client")
   - Gender-neutral throughout

7. **Autosave Recovery Must Call Restore Functions**
   - `nnBuildAllChips()` on load AND restore (not just restore)
   - `autosaveRestoreCheckboxGroup()` for checkbox arrays
   - `autosaveRestoreSeverityPills()` for severity pills
   - Failure to call these leaves DOM empty (silent bug)

8. **State Object Mutation Rules**
   - `itpSelected` (Sets): mutate with `.clear()` and `.add()`, never reassign
   - `dsState.skills` / `dsState.aftercareElements` / `dsState.referrals` (Sets): mutate in place
   - Checkbox arrays (dim1.symptoms, dim3.symptoms, dim5.triggers, dim6.risks): push/filter in place, never reassign
   - Reason: event handlers capture original references; reassignment breaks handlers

9. **Type-Specific Defaults (Productivity Calculator)**
   - PHP: default 5 days/week, 8 hours/day
   - OP: default 4 days/week, 10 hours/day
   - Must assign unconditionally on type switch, not guard with `if (!value)`
   - Guarded defaults lock in whichever type was selected first

10. **Productivity Percentage Calculation**
    - Formula: (Days Worked × Hours Per Day − PTO) ÷ Target %
    - Targets: Residential 65%, PHP 80%, OP 75%
    - PTO is a line-item deduction from billable hours

11. **Session Timer Persistence**
    - Persists across all tool navigation
    - Single session (not per-tool)
    - Start/stop/reset buttons; shows elapsed + start/end times
    - Not cleared by autosave recovery (intentional)

12. **Reset Button Behavior**
    - Clears ALL state objects across ALL 9 tools
    - Clears autosave recovery data (intentional)
    - Requires confirmation modal
    - Does NOT affect Remarkable; only DocAssist data

13. **Discharge Email → discharge@woodhavenohio.com**
    - Default recipient email address
    - Can be changed by user
    - All discharge emails should route here (or user-specified address)

14. **Discharge Summary Does NOT Pre-populate to Email**
    - These are independent workflows
    - Each tool collects its own data
    - No cross-tool data flow between DS and DE

15. **Nursing Note Chip-Building**
    - `nnBuildAllChips()` creates checkboxes for symptoms, MSE, observations, medications, psychiatric symptoms
    - Must be called on fresh page load (in DOMContentLoaded after `pcInit()`)
    - Must be called again on autosave restore
    - Chip containers: `nnState` field arrays drive checkbox state

16. **Autosave 8-Hour Expiry**
    - Snapshots older than 8 hours are discarded
    - No manual cleanup required
    - On page load, `autosaveIsStale()` checks timestamp

17. **Sample Client (Marcus) Triggers Only via Easter Egg**
    - 3× rapid-click on DocAssist logo (2-second window)
    - Populates all tools with continued-stay residential scenario
    - Used for testing and tutorials
    - Not accessible via normal workflow

18. **Changelog Modal**
    - "What's New" button opens modal with version history
    - Lists meaningful clinical/workflow changes only
    - Grouped by date; only most recent date per batch
    - Not every line change is listed

19. **Tutorial/Training System**
    - "How to Use" button opens tutorial overlays
    - Uses Popper.js-like positioning with 380px max width
    - Highlights DOM elements via selector (`sel:`)
    - Loads sample client (Marcus) for demonstration

20. **Generator Bar Validation Message**
    - "Fields left blank will be omitted from the generated narrative" (ASAM)
    - Appears above generate button
    - Updates on field changes
    - Not a warning; a note to counselor

---

## 11. Development Rules

### Code Changes
- **Preserve existing functionality** unless explicitly asked to change it
- **Make the smallest change necessary** — avoid refactoring unrelated code
- **Do not rewrite** when targeted edits will suffice
- **Do not refactor for style** alone
- **Check dependencies** before modifying shared functions
- **Do not alter clinical logic, generated language, calculations, or required fields** without explicit request

### State Mutations
- **Never reassign** `itpSelected`, checkbox arrays, or Set properties
- **Always mutate in place**: `.push()`, `.filter()`, `.clear()`, `.add()`, etc.
- **Why**: event handlers capture original array/Set references; reassignment breaks handlers

### Autosave and Recovery
- **Any new DOM element that persists across page loads** must be restored in `autosaveCollectDom()` and restored in tool-specific restore functions
- **New checkbox groups** must be restored via `autosaveRestoreCheckboxGroup()`
- **New pills/severity selectors** must be restored via `autosaveRestoreSeverityPills()`
- **Failure to restore leaves DOM empty** (silent bug; verify with browser DevTools inspection, not error logs)

### Testing Before Commit
1. **Check brace balance**: `awk '/^<script>/{found=1;next} /^<\/script>/{found=0} found' index.html | python3 -c "import sys; code=sys.stdin.read(); print('Brace diff:', code.count('{')-code.count('}'))"`
2. **Check for duplicate `</script>` tags**: `grep -c "</script>" index.html` (should be 1)
3. **Test changed functionality** manually in browser
4. **Test related functionality** that could be affected
5. **Verify workflows** still operate (navigation, autosave, reset, etc.)
6. **Review Git diff** for unintended changes
7. **Do not claim something was tested** if it was not actually tested

### Git Workflow
- `main` branch is production
- For significant changes, use a feature branch
- Make smallest appropriate change per commit
- Test the change locally before pushing
- Review diff before merging to main
- Never experiment on main without explicit instruction

---

## 12. Git and Branching

### Repository Structure
- **Hosted on GitHub** (Joseph's organization)
- **Deployed via GitHub Pages** to bretzfelder.com/docassist
- **Source**: single `index.html` file (periodically updated by uploading new version to repo)
- **Production branch**: `main`

### Recommended Workflow
1. Create feature branch: `git checkout -b feature/description`
2. Make targeted changes to `index.html`
3. Test locally (open file in browser, verify functionality)
4. Commit with clear message: `git commit -m "Fix: [issue] / Add: [feature]"`
5. Review diff: `git diff main...HEAD`
6. Merge to main: `git merge` (after review)
7. Push to GitHub: `git push origin main`
8. GitHub Pages auto-deploys from main

### Commit Message Convention
- **Fix**: bug or regression
- **Add**: new feature or functionality
- **Improve**: performance, UX, refinement
- **Update**: documentation, dependencies (if any)
- **Refactor**: code structure (rare; only for clarity, not style)

---

## 13. Testing Requirements

Before considering a change complete:

1. **Syntax check**: brace balance, no syntax errors
2. **Functional test**: changed feature works as expected
3. **Regression test**: related features still operate
4. **Autosave test**: if applicable, autosave captures new fields and restore rebuilds DOM
5. **Navigation test**: switching between tools preserves state
6. **Reset test**: reset clears all data including new fields
7. **Mobile test**: if responsive, verify mobile layout still works (380px width)
8. **Tutorial test**: if tutorial steps reference changed element, verify selector still works
9. **Diff review**: no accidental changes to unrelated code

### Verification Checklist
- [ ] JavaScript brace balance is zero
- [ ] No duplicate `</script>` tags
- [ ] Changed feature tested manually
- [ ] Related features still work
- [ ] Autosave recovery (if applicable) tested
- [ ] Git diff reviewed for unintended changes
- [ ] No test claims made without actual testing

---

## 14. GitHub Pages Deployment

### Current Configuration
- **Repository**: Joseph's GitHub organization
- **Branch**: `main` (source)
- **Build**: none (static HTML)
- **Deploy**: automatic on push to main
- **URL**: bretzfelder.com/docassist (CNAME configured)
- **File**: `index.html` (single file)

### Deployment Process
1. Update `index.html` locally or upload new version to GitHub
2. Commit and push to main
3. GitHub Pages auto-deploys (usually <1 minute)
4. Visit bretzfelder.com/docassist to verify

### Rollback
If a deployment breaks production:
1. Revert commit: `git revert <commit-hash>`
2. Push to main
3. GitHub Pages auto-redeploys from reverted code

### Do Not Change
- GitHub Pages settings (branch source, custom domain)
- `.gitignore` (unless explicitly needed)
- Repo visibility or collaborator settings

---

## 15. Security and Privacy

### Never Commit
- Passwords, API keys, access tokens, secrets
- Real client information, PHI (Protected Health Information)
- Test data with realistic names/dates/medical information
- Private credentials or credentials of any kind

### Data Handling
- All client data stays in browser memory (not sent to external servers)
- Autosave stored in browser localStorage only (not cloud)
- No analytics or telemetry (GoatCounter was previously integrated, then removed per Joseph's direction)
- Facilities using DocAssist are responsible for clearing autosave storage when staff logs out (manual Reset button)

### Logging
- Console errors are acceptable (for debugging)
- Do not log sensitive data (client names, PHI, credentials)
- Do not include real data in error messages that might be forwarded externally

### Repository Privacy
- Keep the repository private or restrict access to Woodhaven staff
- Do not fork publicly
- Do not share commits containing real client data or credentials

---

## 16. How the AI Should Approach Changes

### Before Modifying Code
1. **Understand the request** — clarify ambiguity before changing production
2. **Locate relevant code** — use grep to find functions, state objects, DOM elements
3. **Identify dependencies** — determine what else calls or relies on the target
4. **Explain risks** — flag potential side effects before changing
5. **Confirm scope** — make sure you're changing the right thing

### Making the Change
1. **Use `str_replace`** for targeted edits (not wholesale rewrites)
2. **Preserve formatting** (indentation, spacing, line breaks)
3. **Don't refactor unrelated code**
4. **Don't remove functionality** to make new features easier

### After Modifying Code
1. **Review the diff** — ensure only intended lines changed
2. **Check brace balance** — must be zero
3. **Test the change** — manually, in browser
4. **Test related functionality** — anything that depends on the changed code
5. **Report exactly what changed** — quote the change location and what was modified
6. **Report what was tested** — specific workflows/features verified
7. **Flag untestable items** — e.g., "did not verify mobile, no device available"

### Example: Requested Change
```
Request: "Change the default hours for OP from 10 to 12"

Before: grep -n "hoursPerDay": { op: 10 }
After: (change to 12 in two places — defaults and restoration logic)
Tested: 
  - Created new OP counselor, verified default is 12 hours
  - Autosaved, refreshed, restored, verified 12 persisted
  - Changed to existing OP counselor, verified 12 persisted
Did NOT test: mobile UI (assumption that layout remains unchanged)
```

---

## 17. When Requirements Are Ambiguous

### Ask for Clarification
- "Should this change affect ASAM, ITP, or both?"
- "Does this apply to initial admission, continued stay, or both?"
- "Is this a display-only change or does it affect generated output?"
- "Does this affect all LOCs or specific LOCs?"

### Do Not Guess
- Ambiguity in required fields → ask
- Ambiguity in clinical logic → ask
- Ambiguity in workflow → ask
- Ambiguity in generated language → ask

### For Minor Details
- Use existing project conventions (naming, spacing, patterns)
- Follow established UI patterns (colors, font sizes, layout)
- Mirror similar code elsewhere in the codebase

---

## 18. Documentation Rule

**Keep this `AGENTS.md` file current** as DocAssist evolves.

### When to Update AGENTS.md
- **Significant architectural change** (new tool, data flow change, state restructure)
- **New required field or validation rule**
- **New calculation or scoring logic**
- **New generated content or output format**
- **Change to autosave/recovery behavior**
- **Change to deployment or Git workflow**
- **Change to production-critical behavior**

### What NOT to Update
- Typo fixes in generated text (update the code, not AGENTS.md)
- Minor UI tweaks (colors, spacing, font sizes)
- Internal refactoring that doesn't change behavior
- Bug fixes that restore intended behavior

### Update Process
1. Make the code change
2. Update AGENTS.md in the same commit (or note the change in commit message)
3. Verify AGENTS.md still accurately describes current behavior
4. Commit: `git commit -m "Update AGENTS.md: [describe change]"`

---

## 19. Quick Reference: Key Functions and State

### Main State Objects
```javascript
const state = {}           // ASAM: loc, admissionType, dim1–6 (with all fields)
const itpSelected = {}     // ITP: { A: Set(), B: Set(), C: Set() }
const snState = {}         // Individual Note: clientName, date, type, all fields
let dsState = {}           // Discharge Summary: clientName, dates, phases, skills (Set), etc.
let deState = {}           // Discharge Email: clientName, date, recipient, all fields
const nnState = {}         // Nursing Note: date, vitals, symptoms, MSE, medications, etc.
let asaState = {}          // ASA Intervention: clientName, date, event, response, etc.
let pcCounselors = []      // Productivity: array of counselor objects
```

### Core Functions
| Function | Purpose |
|----------|---------|
| `generate()` | Validates ASAM, generates narrative + criteria + risk ratings |
| `renderCriteria()` | Builds Remarkable criteria checklist |
| `renderRiskRatings()` | Builds 0–4 risk rating panel |
| `renderITPGoals()` | Builds ITP sections (A, B, C) |
| `rebuildSection(section)` | Rebuilds single ITP section |
| `formatITPOutput(btn)` | Formats ITP to copy-able boxes; checks SMART |
| `snGenerate()` | Generates individual note (two outputs) |
| `navigateTo(view)` | Switches between tool views |
| `switchTab(n)` | Switches ASAM output tab (1 or 2) |
| `doReset()` | Clears all state + autosave; asks confirmation |
| `fillSampleClient()` | Loads Marcus sample data across all tools |
| `autosaveSave()` | Saves snapshot to localStorage |
| `autosaveRestore()` | Restores state + DOM from snapshot |
| `autosaveClear()` | Clears autosave snapshot |
| `nnBuildAllChips()` | Builds nursing note checkboxes (critical for init) |
| `pcInit()` | Initializes Productivity Calculator |
| `pcSave()` / `pcLoad()` | Productivity Calculator persistence |

### Key DOM Element IDs
| Element | ID | Purpose |
|---------|----|---------  |
| ASAM view | `view-asam` | Container |
| ITP view | `view-itp` | Container |
| Individual Note view | `view-note` | Container |
| Group Notes view | `view-group` | Container |
| Discharge Summary view | `view-discharge` | Container |
| Discharge Email view | `view-discharge-email` | Container |
| Nursing Note view | `view-nn` | Container |
| ASA view | `view-asa` | Container |
| Productivity view | `view-productivity` | Container |
| Reset button | `mainResetBtn` | Click handler for reset |
| Autosave indicator | `autosaveIndicator` | Status display |
| Session timer | (various `timer-*` IDs) | Timer display + controls |
| LOC selector | `loc-select` | Dimension driver selector |
| Admission type toggle | (radio buttons) | Initial vs. Continued Stay |

### Key localStorage Keys
| Key | Purpose |
|-----|---------|
| `docassist_autosave_v1` | ASAM autosave snapshot (8-hour expiry) |
| `docassist_productivity_v1` | Productivity Calculator persistent data |

---

## 20. Known Issues and Limitations

### Productivity Calculator (Known Bugs, as of Last Update)
1. **61RSG toggle** not functioning correctly; fields always visible instead of conditionally shown
2. **PTO not factoring into residential monthly** productivity percentage
3. **Copy-to-week feature** in progress (not yet complete)

### Areas That Could Fail
- **Silent DOM initialization failure**: if chip/checkbox restore functions aren't called, DOM remains empty even though state is populated (requires DevTools inspection to detect; no error thrown)
- **Autosave staleness check**: if system clock is set incorrectly, staleness calculation may be wrong
- **localStorage quota exceeded**: if snapshots are large and quota is small, autosave write may fail silently (indicator will show error state)

### Not Yet Implemented
- **Cross-tool prepopulation** beyond ITP → ASAM goals reference (Discharge Summary does not prepopulate from any tool)
- **Assessment tools** (permanently shelved; no assessment tool exists)
- **Treatment team meeting tool** (conceptually planned; not yet built)

---

## 21. How to Use This Document

**For a new AI working on DocAssist**:
1. Read sections 1–3 to understand project purpose and architecture
2. Read section 4 (Data Flow) to see how tools connect
3. Read sections 5–7 to understand clinical logic, generated content, and client data
4. Read sections 8–10 (persistence, UI, production-critical behavior) for must-not-break rules
5. Read sections 11–18 (development rules, testing, security) before making changes
6. Refer to section 19 (quick reference) and section 20 (known issues) as needed during work

**For updating AGENTS.md**:
1. After making a code change, update the relevant section(s)
2. Ensure descriptions match current code behavior (not intended behavior)
3. Add new production-critical behavior to section 10 if applicable
4. Update section 20 (known issues) if bugs are fixed or new limitations arise
5. Keep language clear and specific; avoid hypotheticals

---

*Last updated: August 23, 2026*
*DocAssist version: ~14,600 lines, 9 tools, single-file architecture*
*Production deployment: bretzfelder.com/docassist*

---

# Part II — Clinical Training

The following section preserves the Training project knowledge and development instructions.

Important interpretation rule: any item in this section labeled **Assumption**, **Likely**, **Not confirmed**, **Question**, **Current knowledge**, or **Action needed** is background context, not a verified repository fact. Inspect the current repository before acting on it.

**Last updated:** August 2026  
**Status:** Active production application  
**Purpose:** Reference guide for AI coding agents modifying the Training application

---

## 1. Training Overview

### What Training Is

**Clinical Training** (internally called "Training"; formerly "DocTrain") is an interactive, self-contained web application for training staff at Woodhaven, a residential substance use disorder treatment facility.

### Purpose

Training teaches clinical and administrative staff *why* documentation matters and *how* to do it correctly. The core philosophy: staff entered this work to help clients. Documentation isn't busywork — it protects the client's ability to continue in treatment by creating the continuous, traceable record that regulatory bodies require. When staff understand documentation as a clinical tool rather than a burden, compliance improves and client care improves.

### Intended Users

Frontline residential substance use treatment staff at Woodhaven, including:
- Counselors and clinicians
- Residential support staff
- Administrative staff involved in client care
- New hires in onboarding

The application assumes users have clinical or adjacent healthcare knowledge but may have limited documentation experience or high anxiety about "getting it wrong."

### Problem It Solves

1. **Knowledge gaps**: Staff often don't understand the *why* behind documentation requirements, making it easy to miss or misinterpret what should be documented.
2. **Motivation fluctuation**: Staff intending to document well still face moment-to-moment motivation challenges. Training makes learning feel interactive and achievable, not preachy.
3. **Regulatory risk**: Incomplete or incorrect documentation creates liability. Training reduces that risk by building competency.
4. **Onboarding burden**: New staff need to learn both clinical skills and documentation practices. Training provides scalable, self-paced onboarding.

### How It Is Intended to Be Used

**Workflow:**
1. Staff access the application (hosted at `bretzfelder.com/training`).
2. They arrive at a home screen showing two learning tracks: **Documentation Skills** and **Clinical Skills**.
3. They navigate into a module of their choice.
4. Within each module, they progress through **beats** — small, interactive chunks of content designed to teach one idea at a time.
5. Many modules include quizzes, interactive exercises, or scenario walkthroughs that reinforce learning.
6. Progress is saved in `localStorage`, so staff can resume where they left off.
7. Completion status is tracked visually in the sidebar.

**Not a test-gating system:** Training is not a prerequisite certificate system. The quizzes and exercises are learning tools, not gatekeepers. Staff can complete modules in any order.

### Overall User Experience

- **Gentle entry**: Modules open gently; users are not thrust into large blocks of text.
- **Progressive disclosure**: Content is revealed one beat at a time, often with click-to-expand sections.
- **Interactive, not passive**: Most modules include classifying exercises, quizzes, or scenario work rather than pure reading.
- **Non-preachy**: Content avoids moral framing ("you should..." language). Instead, it treats staff as intelligent professionals and frames learning around what they actually encounter on shift.
- **Practical focus**: Abstract concepts are grounded in real Woodhaven procedures, levels of care, and client scenarios.
- **Recurring case study**: Danielle, a specific client with a documented history and family situation, appears across multiple modules so staff can see the *same* person reflected in different documentation contexts.

---

## 2. Application Architecture

### Deployment Model

**Single self-contained HTML file** (`index.html`). No separate JavaScript files, no build step, no transpiler. Everything is vanilla HTML5 + CSS + JavaScript in one file.

**External dependencies:** Only Google Fonts (IBM Plex Sans and IBM Plex Mono). All application logic, styling, and content are embedded.

### Main Files

- **`index.html`** — The sole deliverable. Contains all HTML structure, CSS styling, JavaScript logic, and content (beat definitions, quiz items, module data).

### HTML Structure Overview

```
<!DOCTYPE html>
<html>
  <head>
    <!-- Title, meta tags, favicon, fonts, global styles -->
  </head>
  <body>
    <div class="app">
      <aside class="sidebar">
        <!-- Navigation, progress tracking, sidebar actions -->
      </aside>
      <main class="main">
        <!-- View containers (view-home, view-bp, view-asam, etc.) -->
        <!-- Each view contains module sections -->
      </main>
    </div>
    <script>
      <!-- All application logic, beat definitions, quiz data, module code -->
    </script>
  </body>
</html>
```

### Key Stylesheets and Organization

**Global Styles:**
- CSS custom properties for consistent theming (colors, spacing, radii).
- Layout grid: sidebar (280px fixed, sticky, full viewport height) + main content area (flex: 1, max-width 820px, with padding).
- Typography: IBM Plex Sans (body), IBM Plex Mono (code/eyebrows).
- Color palette:
  - Primary green: `--green-900` (darkest) to `--green-050` (lightest)
  - Accent amber: used for callout boxes and warnings
  - Alert red: used for critical information
  - Neutral cream/white for backgrounds

**Component Styles:**
- `.sidebar`, `.sidebar-title`, `.nav-item`, `.nav-check` — navigation
- `.main`, `.module`, `.eyebrow`, `h1`, `h2`, `h3` — content layout and typography
- `.beat`, `.reveal` — progressive disclosure
- `.quiz-*`, `.option-*` — quiz rendering
- `.classify-row`, `.classification-card` — classification exercises
- `.callout`, `.callout-amber`, `.callout-red` — informational boxes
- `.dashed-box`, `.muted` — styling for incomplete/future features on home screen

### JavaScript Organization

**No modular structure.** All code is procedural, global, organized into logical sections by module (top-level comments mark section breaks).

**Key global objects and arrays:**
- `WELCOME_BEATS`, `THREAD_BEATS`, etc. — arrays of beat definitions (structured data, not functions)
- `SECTION_TO_CONTAINER` — mapping of module sections to HTML container IDs
- `asamProgress`, `itpProgress`, `noteProgress`, `locProgress`, etc. — per-module progress objects tracking user completion of each section
- `QUIZ_ITEMS`, `ASSEMBLY_ITEMS`, etc. — quiz/exercise data specific to each module

**Key global functions:**
- `showView(viewId)` — switches which view/module is visible on screen
- `registerBeats(containerName, beatsArray, finalCallback, renderCallback, checkCompletionFn)` — initializes beat rendering for a module section
- `markSectionComplete(sectionId)` — saves completion to localStorage and updates UI
- `showBeat(beatContainerId, beatIndex)` — reveals the next beat in a sequence
- `buildQuiz(containerId, quizItems, onCompleteCallback)` — dynamically renders a quiz
- `renderClassify(...)` / `renderDecision(...)` / etc. — specific rendering functions for interactive exercises
- `updateProgress()` — recalculates overall completion percentages
- `resetAll()` — clears all progress from localStorage (used when testing or for staff to reset)

### Data Structures

**Beat Definition:**
```javascript
{
  title: "A human-readable title",
  content: "HTML content as a string",
  // optional:
  image: "URL or inline data URI",
  note: "Additional context or callout",
  reveal: [/* array of reveal sections, each with title and content */]
}
```

**Quiz Item:**
```javascript
{
  prompt: "The question text",
  options: ["Option A", "Option B", "Option C"],
  correctIdx: 1, // 0-indexed
  explain: "Explanation shown after answer"
}
```

**Classification/Decision Item:**
```javascript
{
  prompt: "Statement or scenario",
  options: ["Choice A", "Choice B"],
  correctIdx: 0,
  explain: "Why this classification is correct"
}
```

### Configuration

There is no separate config file. All configuration is embedded as JavaScript constants:
- Module titles and descriptions (in section heading HTML)
- Sidebar navigation structure (built by module-specific `renderXXXNav()` functions)
- Color overrides (CSS custom properties in `<style>`)
- Favicon (inline SVG data URI; green open-book icon)

### External Dependencies

1. **Google Fonts** — IBM Plex Sans and IBM Plex Mono, loaded via `<link>` in `<head>`. Fallback sans-serif and monospace fonts are specified in CSS.
2. **No JavaScript libraries** — No jQuery, Bootstrap, React, Vue, or any third-party JS. All DOM manipulation is vanilla.
3. **Browser APIs used:**
   - `localStorage` — to persist progress
   - `querySelector` / `getElementById` / standard DOM methods
   - `JSON.stringify` / `JSON.parse` — for serializing progress objects

### Navigation Structure

The application uses a **view-based routing model** (not URL-based). All content is on one page; visibility is controlled by CSS display rules.

**Views (top-level containers, mutually exclusive):**
- `view-home` — home/landing screen showing two tracks
- `view-bp` — The Golden Thread (Track 01 foundational module)
- `view-asam` — ASAM Documentation (Track 01)
- `view-itp` — Individual Treatment Plans (Track 01)
- `view-note` — Individual Notes (Track 01)
- `view-loc` — Levels of Care (Track 01)
- `view-concl` — Case Walkthrough: Danielle (Track 01)
- `view-coc` — Co-Occurring Disorders (Track 02)
- `view-mi` — Motivational Interviewing (Track 02)
- `view-gr` — Group Facilitation Skills (Track 02)
- `view-eth` — Ethics & Boundaries (Track 02)
- `view-fam` — Family Systems (Track 02)
- `view-cult` — Cultural Humility (Track 02)
- `view-conflict` — (Planned) Conflict De-escalation and Resolution

**Sidebar navigation** shows a different set of items depending on which track or module the user is viewing. The sidebar has a "back" button to return to home or to the track overview.

---

## 3. Major Features

### Feature 1: Beat-Reveal Engine (Core Infrastructure)

**What it does:**
Renders content progressively, one "beat" at a time. A beat is a self-contained chunk of information. Users click "Next" to reveal the next beat, or beats can auto-reveal based on completion of interactive elements (e.g., answering a quiz).

**How users access it:**
Every module uses beats. Users simply navigate into a module and see beats reveal as they scroll/click.

**Information used:**
- Array of beat objects (title, content, optional image, optional reveal sections)
- Completion state (has this beat been shown? has the user completed the final beat?)

**Information produced:**
- Marks each beat container as "shown" via DOM manipulation
- Triggers render callbacks when all beats are complete
- Saves completion milestone to `localStorage`

**Implementation:**
- `registerBeats(containerName, beatsArray, finalCallback, renderCallback, checkCompletionFn)` — initializes
- `showBeat(beatContainerId, beatIndex)` — renders the next beat
- HTML template (in-page) defines `.beat-container` divs with unique IDs

**Dependencies:**
- Used by every module
- Depends on `markSectionComplete()` to save progress
- Depends on `checkCompletionFn` callback to determine when to mark complete

### Feature 2: Interactive Quiz System

**What it does:**
Renders a quiz where users select the correct answer from options. On submission, provides immediate feedback (explanation of why the answer is correct/incorrect).

**How users access it:**
Embedded within module beats. Typically appears as a quiz question after explanatory content.

**Information used:**
- Array of quiz item objects (prompt, options, correctIdx, explanation)
- User's selected answer

**Information produced:**
- Marks the section as complete once a quiz is answered correctly
- Displays congratulatory message and explanation

**Implementation:**
- `buildQuiz(containerId, quizItems, onCompleteCallback)` — renders quiz options dynamically
- Event listeners on option buttons handle answer selection
- Correct answer triggers `onCompleteCallback` (usually `markSectionComplete(sectionId)`)

**Dependencies:**
- Used by 15+ modules
- Depends on `markSectionComplete()` to save progress
- Should only render in response to explicit completion, not partial progress

### Feature 3: Classification/Decision Exercises

**What it does:**
Presents a statement or scenario and asks users to classify it into categories (e.g., "Safe inference" vs. "Needs to be checked by asking"). Like quizzes, provides immediate feedback.

**How users access it:**
Embedded within module beats, particularly in ASAM, ITP, and Cultural Humility modules.

**Information used:**
- Array of classification item objects (prompt, options, correctIdx, explanation)
- User's selected category

**Information produced:**
- Marks section as complete when answered correctly
- Displays explanation reinforcing the learning

**Implementation:**
- `renderClassify(...)` — specific rendering function for each module's classification exercise
- `renderDecision(containerId, itemsArray, classPrefix, showFunctionCallback)` — generic renderer for decision-tree exercises
- `.classify-row` CSS — full-width card layout for decision options
- Multiple module-specific variations: `asamRenderClassify()`, `itpRenderClassify()`, etc.

**Dependencies:**
- Used across 8+ modules
- Each module has its own `renderXXXClassify()` wrapper function
- Depends on `markSectionComplete()` to save progress

### Feature 4: Progress Tracking and Persistence

**What it does:**
Saves user progress to `localStorage` so that staff can resume where they left off, even after closing the browser. Tracks which sections of which modules have been completed.

**How users access it:**
Automatically. No explicit action required. Progress is saved in the background.

**Information used:**
- Module-specific completion keys (e.g., `asamProgress['specificity']`, `itpProgress['itpobjectives']`)
- Timestamps (optional; not currently used but structure is in place)

**Information produced:**
- Completion badges in sidebar (checkmarks on completed items)
- Progress bar showing overall completion percentage
- Persistent state across sessions

**Implementation:**
- `markSectionComplete(sectionId)` — saves to `localStorage[asamProgress]`, `localStorage[itpProgress]`, etc.
- On page load, all `XXXProgress` objects are restored from `localStorage` (code at bottom of script tag)
- `updateProgress()` — recalculates sidebar progress bar based on all completion states
- `resetAll()` — clears all progress from `localStorage` (triggered by "Reset Progress" link in sidebar)

**Dependencies:**
- Every interactive feature (quiz, classification, beat reveal) calls `markSectionComplete()` when done
- Sidebar navigation calls `updateProgress()` to refresh display
- No external server or sync; purely local browser storage

### Feature 5: Sidebar Navigation

**What it does:**
Shows the current module's sections in a left sidebar. Indicates completion with checkmarks. Allows users to jump to any section. Shows overall progress. Provides a "back to home" button.

**How users access it:**
Always visible on the left side of the screen (except on very small mobile screens where it may stack differently).

**Information used:**
- Module-specific section lists (built by `renderXXXNav()` functions)
- Completion state from `localStorage`
- Current active section (to highlight it)

**Information produced:**
- Visual navigation list
- Progress bar percentage
- Completion checkmarks

**Implementation:**
- `renderASAMNav()`, `renderITPNav()`, `renderNoteNav()`, etc. — module-specific functions that build the navigation list
- `.nav-item` and `.nav-check` CSS for styling
- `markNavItemActive(sectionId)` — highlights current section
- `.nav-item` click handlers call `showView(viewId)` to navigate

**Dependencies:**
- Depends on `markSectionComplete()` to update checkmarks when sections finish
- Depends on `updateProgress()` to refresh the progress bar
- Each module must have a corresponding `renderXXXNav()` function

### Feature 6: Case Study — Danielle

**What it does:**
A recurring fictional client (Danielle) is used as a case study across multiple modules. Her ASAM assessment, treatment plan, notes, and clinical scenarios appear in different documentation contexts so staff see the same person through different documentation lenses.

**How users access it:**
As part of module content, particularly in ASAM, ITP, Individual Notes, and Case Walkthrough: Danielle modules.

**Information used:**
- Danielle's fictional background (single, returning to mother's house, no children)
- Her ASAM assessment results
- Her treatment plan objectives
- Her progress notes
- Her clinical responses in motivational interviewing and family therapy scenarios

**Information produced:**
- Content that illustrates "the same person" across different documentation types
- Continuity of learning (staff see how an ASAM finding becomes an ITP objective becomes an individual note)

**Implementation:**
- Danielle's data is embedded in module content (beats, quizzes, scenarios)
- No separate data structure; she exists as textual references and scenario details throughout the codebase
- Particularly prominent in `view-concl` (Case Walkthrough: Danielle)

**Dependencies:**
- Used across 5+ modules
- Must maintain consistent characterization across all modules (single, returning to mother's house, no children; no contradictions)
- Historical note: Earlier versions incorrectly had her with a husband named Mark and children; this was corrected

### Feature 7: Module-Specific Content and Rendering

The application includes 12 completed modules, each with unique content, interactive elements, and rendering logic.

Each module follows a pattern:
1. **Beat definitions** (arrays like `XXX_BEATS`)
2. **Quiz/classification data** (arrays like `XXX_QUIZ_ITEMS`)
3. **Rendering functions** (`renderXXXNav()`, `renderXXXClassify()`, etc.)
4. **Navigation initialization** (`registerBeats()` calls)

**Modules:**
1. **The Golden Thread** — foundational intro to the ASAM→ITP→Note linking
2. **ASAM Documentation** — 11 tracked sections covering assessment dimensions
3. **Individual Treatment Plans (ITP)** — structure and purpose
4. **Individual Notes** — documentation requirements, legal distinctions (subpoena-ready)
5. **Levels of Care (LOC)** — Woodhaven's five levels (1, 2.1, 2.5, 3.5, 3.7WM)
6. **Case Walkthrough: Danielle** — integrates ASAM, ITP, Notes, LOC into one scenario
7. **Co-Occurring Disorders (CoC)** — addressing mental health alongside substance use
8. **Motivational Interviewing (MI)** — spirit, stages, techniques
9. **Group Facilitation Skills** — types, dynamics, difficult situations
10. **Ethics & Boundaries** — dual relationships, confidentiality, gift-giving
11. **Family Systems** — roles, codependency, enabling, family sessions
12. **Cultural Humility** — non-political, treats all cultural/political views with equal curiosity

---

## 4. User Workflows

### Workflow 1: First-Time User Arriving at Training

1. User loads `bretzfelder.com/training`
2. Sees home screen (`view-home`) with two prominent tracks:
   - **Track 01 — Documentation Skills** (contains: The Golden Thread, ASAM, ITP, Notes, LOC, Case Walkthrough)
   - **Track 02 — Clinical Skills** (contains: CoC, MI, Group Facilitation, Ethics, Family Systems, Cultural Humility)
3. User reads brief descriptions and chooses a module
4. Clicks on module title
5. `showView('view-xxx')` is called; sidebar renders module-specific navigation
6. First beat of first section appears
7. User reads beat, scrolls to "Next" button, clicks to reveal next beat
8. Progress is saved automatically to `localStorage`

### Workflow 2: Resuming Training

1. User loads `bretzfelder.com/training`
2. Page loads; `localStorage` is checked for prior progress
3. All completion states are restored (checkmarks appear on completed sections)
4. User is still on home screen; they click into a module or section to resume
5. User sees the next uncompleted beat

### Workflow 3: Completing an Interactive Section

1. User progresses through beats up to a quiz or classification exercise
2. Interactive element appears (e.g., "Which of these is a safe inference?")
3. User reads options and clicks one
4. If incorrect, feedback appears; user is invited to try again (or immediately shown why they're correct)
5. On correct answer, congratulatory message appears
6. Section is marked complete in sidebar (checkmark appears)
7. Progress bar updates to reflect new completion percentage
8. State is saved to `localStorage`
9. User may see a "Next Section" button to proceed

### Workflow 4: Jumping Between Sections

1. User is in ASAM module, on the "Specificity" section
2. User wants to jump to the "Criteria" section (another section in ASAM)
3. User clicks "Criteria" in sidebar navigation
4. `showView('view-asam-criteria')` is called; that section's content appears
5. The sidebar highlights "Criteria" as the active section
6. User's progress in other sections is unaffected

### Workflow 5: Using the Case Walkthrough

1. User completes or reviews ASAM, ITP, Notes, and LOC modules
2. User navigates to "Case Walkthrough: Danielle" (in Documentation Skills)
3. Sees Danielle's complete documentation arc: her ASAM, her ITP based on that ASAM, her note based on that plan, and how her level of care was determined
4. Interactive elements walk through how each piece connects to the others
5. "The Golden Thread" concept becomes concrete and memorable

---

## 5. Data Flow

### User Input

**No form submission or server communication.** All input is:
1. **Quiz/classification answers** — selected via click, stored transiently in the page, never sent anywhere
2. **Navigation clicks** — trigger view changes, stored as sidebar state (not persisted)
3. **Beat reveal clicks** — trigger progressive content display

### Information Storage

**All persistent information** is stored in `localStorage` as JSON-stringified objects:

```javascript
localStorage['asamProgress'] = JSON.stringify({
  'specificity': true,
  'dim1': true,
  'dim2': true,
  // ... etc
})

localStorage['itpProgress'] = JSON.stringify({
  'itpfromfinding': true,
  'itpobjectives': true,
  // ... etc
})

// Similar structures for:
// noteProgress, locProgress, bpProgress, cocProgress,
// miProgress, groupProgress, ethProgress, familyProgress, cultProgress, conclusionProgress
```

### Information Movement Between Components

1. **Quiz answer → progress update:**
   - User clicks option → `buildQuiz()` checks if correct → calls `onCompleteCallback` → calls `markSectionComplete(sectionId)` → updates sidebar checkmark and progress bar

2. **Beat reveal → progress check:**
   - `registerBeats()` is called with a `checkCompletionFn` → when all beats are shown, completion callback fires → triggers render callbacks and calls `markSectionComplete()`

3. **Navigation click → view switch:**
   - User clicks sidebar item → click handler calls `showView(viewId)` → all section elements hidden except the active one → navigation function rebuilds sidebar (e.g., `renderASAMNav()`) → checkmarks reflect saved progress

### Information Calculated or Generated

1. **Progress percentage** — calculated by `updateProgress()` based on count of completed sections vs. total sections
2. **Completion badges** — generated by `renderXXXNav()` based on querying `localStorage`
3. **Quiz/classification feedback** — generated from `explain` field of quiz/classification item data

### Information Persistence

**Persistent (survives page reload):**
- Module completion states (all `XXXProgress` objects in `localStorage`)

**Transient (cleared on page load/refresh):**
- Which beat is currently being viewed (rebuild from progress state)
- Current active section/view (reset to home on reload, unless browser history/back button is used)

### Information Cleared or Reset

**The `resetAll()` function** clears all progress:
```javascript
function resetAll(){
  if(confirm('Clear all progress? This cannot be undone.')){
    localStorage.removeItem('asamProgress');
    localStorage.removeItem('itpProgress');
    // ... etc for all module progress keys
    location.reload();
  }
}
```

This is only triggered by the "Reset Progress" link in the sidebar (shown on home screen) and is protected by a confirmation dialog.

---

## 6. UI/UX

### Layout

**Desktop/Tablet Layout:**
- Sidebar (280px fixed width) on the left
- Main content area (flex: 1, max-width 820px) on the right
- Body background: cream (`--cream`, `#faf8f3`)
- Sidebar background: dark green (`--green-900`, `#122a1e`)

**Mobile Layout:**
- (Not explicitly documented in code, but sidebar is sticky and `overflow-y: auto`, so it may stack on very narrow screens)
- Main content area padding: `44px 48px 120px` (large padding to ensure content isn't cramped)
- This layout has been tested but specific breakpoint is not documented in code

### Navigation

**Primary Navigation: Sidebar**
- Always visible (sticky, viewport height)
- Shows module-specific sections (e.g., for ASAM: "Why Documentation Matters", "Specificity", "Dimension 1", etc.)
- Each section item is clickable to jump directly to that section
- Active section is highlighted (`.nav-item.active`)
- Completed sections show a green checkmark (`.nav-check.done`)
- "Back to Home" button at top of sidebar (`.sidebar-back`)

**Secondary Navigation: Module Selection**
- Home screen shows two tracks as clickable cards
- Each track lists its modules
- Modules are clickable to enter that module

**Breadcrumb/Context:**
- Eyebrow text (`.eyebrow`) at the top of main content shows current module/track (e.g., "TRACK 01 — DOCUMENTATION SKILLS")

### Buttons and Links

**Primary buttons:**
- `.btn` (green background, white text)
- Used for "Next", "Continue", "View Module" actions
- Full-width on mobile, auto-width on desktop

**Secondary buttons:**
- `.sidebar-back`, `.reset-link` — smaller, less prominent
- Used for navigation back/reset actions

**Inline links:**
- `.inline-link` — styled with green color and underline
- Used for cross-references within content

**Quiz/Classification option buttons:**
- Full-width cards with left-aligned text (`.option-button`)
- Hover effect (subtle background change)
- Click to select, no submit button (answers are immediate)

### Forms and Input

**No traditional forms.** All interaction is via:
- Click-to-select multiple choice options
- Click-to-reveal beats ("Next" button)
- Click-to-navigate sidebar items

### Dialogs/Modals

**No modal dialogs.** Confirmation is via `window.confirm()` (browser native, used only for `resetAll()`).

### Notifications/Feedback

**Feedback appears inline in the page:**
- Quiz answer feedback: text appears below quiz options explaining why the answer is correct/incorrect
- Completion messages: "Great job!" or "You've completed this section" text appears
- Progress bar updates immediately when sections complete
- Sidebar checkmarks appear immediately

No toast notifications, no snackbars, no modal alerts (except for reset confirmation).

### Color and Styling Conventions

**Color Palette (CSS custom properties):**
- `--green-900` (#122a1e) — sidebar background, dark headings
- `--green-800` (#1b3a2b) — slightly lighter, used for hover states
- `--green-700` (#2a5940) — primary accent (links, active states)
- `--green-500` (#4c9a6f) — progress bar, badges, highlights
- `--green-050` (#f4f8f5) — sidebar text, light backgrounds
- `--cream` (#faf8f3) — body background (warm off-white)
- `--ink` (#1e2622) — body text (dark gray-green)
- `--ink-soft` (#4c5850) — secondary text (lighter gray-green)
- `--amber` (#b8860b) — accent for callout boxes
- `--amber-bg` (#fdf3dd) — callout background
- `--red` (#a3382f) — critical/warning information
- `--red-bg` (#fbeceb) — warning background
- `--border` (#d8ded9) — divider lines

**Callout Boxes:**
- `.callout` — neutral information (light background, subtle border)
- `.callout-amber` — warning/important (amber background)
- `.callout-red` — critical/alert (red background)

**Typography:**
- Headings: IBM Plex Sans, weights 700–800
- Body: IBM Plex Sans, weight 400
- Monospace (code): IBM Plex Mono, weight 400
- Eyebrows: IBM Plex Mono, weight 500, uppercase, letter-spaced

### Responsive Behavior

**Stated approach:**
- Desktop-first design
- Sidebar remains sticky and full-height on desktop
- Main content max-width (820px) ensures readability

**Mobile behavior:**
- Not explicitly documented; appears to be fallback CSS without a formal mobile breakpoint
- Sidebar may stack or compress on very narrow screens, but this is not verified in the code

### Terminology

**User-facing terminology:**
- "Module" — a complete learning unit (e.g., "ASAM Documentation")
- "Section" — a subsection within a module (e.g., "Dimension 1" within ASAM)
- "Beat" — a single, progressive chunk of content within a section
- "The Golden Thread" — the core concept linking ASAM → ITP → Notes
- "Levels of Care" — Woodhaven's five residential treatment intensities
- "Danielle" — the recurring case study client
- "Track" — a major category of modules (Track 01: Documentation Skills; Track 02: Clinical Skills)

**Internal terminology (not user-facing):**
- `progress` objects — nested structures tracking section completion
- `registerBeats()` — initialization function for a module section
- `renderXXXNav()` — function that builds the sidebar navigation for a module
- `classifying` / `classification` — exercises where users categorize statements

### Established Design Patterns

1. **Beat reveal pattern:** Content appears progressively; users click "Next" to continue. Encourages step-by-step engagement.
2. **Sidebar + main content pattern:** Fixed left nav, flexible right content. Allows for quick jumping between sections.
3. **Inline interaction pattern:** Quizzes, classifications, and exercises appear inline within content, not in separate views or modals.
4. **Progress visibility pattern:** Checkmarks and progress bar in sidebar provide immediate visual feedback.
5. **Case study pattern:** Danielle's recurring appearance creates continuity and makes abstract concepts concrete.
6. **Callout box pattern:** Colored boxes highlight important information (warnings, tips, key points).

---

## 7. Important Functions and Logic

### Core Navigation and View Management

#### `showView(viewId)`
- **Purpose:** Switches which module/view is visible on screen
- **How it works:**
  1. Hides all elements with class `.module`
  2. Shows element with ID matching `viewId` (e.g., `view-asam`)
  3. Calls the corresponding `renderXXXNav()` function to update the sidebar
  4. Calls `updateProgress()` to refresh progress bar
- **Signature:** `showView(viewId)` — e.g., `showView('view-asam')`
- **Callers:** sidebar navigation item click handlers, "back to home" button, module selection on home screen
- **Dependencies:** DOM element IDs must match viewId pattern

#### `updateProgress()`
- **Purpose:** Recalculates overall completion percentage and updates the progress bar
- **How it works:**
  1. Iterates through all `XXXProgress` objects
  2. Counts completed sections across all modules
  3. Calculates percentage (completed / total)
  4. Updates progress bar width (`--progress-percent` CSS custom property)
  5. Updates progress text
- **Called by:** Most completion functions, navigation functions
- **Dependencies:** All `XXXProgress` objects must be defined and accessible

### Progress Tracking

#### `markSectionComplete(sectionId, moduleKey)`
- **Purpose:** Marks a section as complete and saves to `localStorage`
- **How it works:**
  1. Sets `moduleProgress[sectionId] = true` (or timestamp, if implemented)
  2. Serializes progress object to JSON
  3. Stores in `localStorage[moduleKey]`
  4. Updates sidebar checkmark via DOM
  5. Calls `updateProgress()` to refresh progress bar
- **Signature:** `markSectionComplete(sectionId, moduleKey)` — e.g., `markSectionComplete('specificity', 'asamProgress')`
- **Critical behavior:** **Completion badges must be triggered in the same beat that marks completion**, not in a later beat — this was a real bug in earlier versions
- **Callers:** Quiz callbacks, classification callbacks, final beat callbacks
- **Dependencies:** Module-specific progress keys must exist in `localStorage`

#### `resetAll()`
- **Purpose:** Clears all progress from `localStorage` and reloads the page
- **How it works:**
  1. Shows confirmation dialog: "Clear all progress? This cannot be undone."
  2. If confirmed, removes all `localStorage[XXXProgress]` keys
  3. Reloads page via `location.reload()`
- **Callers:** Only the "Reset Progress" link in sidebar (on home screen)
- **Dependencies:** Must preserve the confirmation dialog to prevent accidental data loss

### Beat Reveal Engine

#### `registerBeats(containerName, beatsArray, finalCallback, renderCallback, checkCompletionFn)`
- **Purpose:** Initializes beat reveal for a module section
- **How it works:**
  1. Stores beats array internally
  2. Defines the container element's behavior
  3. Attaches "Next" button listener
  4. Calls `renderCallback` (if provided) to render initial content
  5. When all beats are revealed, calls `finalCallback` and marks section complete
- **Signature:** Complex; see code for full details. Example:
  ```javascript
  registerBeats('specificityBeats', SPECIFICITY_BEATS, SPECIFICITY_FINAL, 
    renderClassify, ()=>!!asamProgress['specificity'])
  ```
- **Key detail:** `checkCompletionFn` is called to check if a section is already complete; if so, beats are skipped and render callback is called directly
- **Callers:** Module initialization (bottom of script)
- **Dependencies:** Beat container HTML element must exist in DOM; beats array must be well-formed

#### `showBeat(beatContainerId, beatIndex)`
- **Purpose:** Renders the next beat in the sequence
- **How it works:**
  1. Fetches the beat at `beatIndex` from the beats array
  2. Renders beat title, content, image (if present)
  3. Appends to container
  4. Creates "Next" button for next beat (or completion button for final beat)
  5. Increments `beatIndex`
- **Called by:** "Next" button event listener
- **Dependencies:** Beats array must be in scope; container element must exist

### Interactive Elements (Quizzes, Classifications)

#### `buildQuiz(containerId, quizItems, onCompleteCallback)`
- **Purpose:** Dynamically renders a quiz with multiple choice options
- **How it works:**
  1. Iterates through `quizItems` array
  2. Renders question prompt
  3. Renders clickable option buttons (full-width, left-aligned cards)
  4. Attaches click handler to each option
  5. On click, checks if answer index matches `correctIdx`
  6. If correct, displays explanation and calls `onCompleteCallback`
  7. If incorrect, may show feedback and allow retry (varies by module)
- **Signature:** `buildQuiz(containerId, quizItems, onCompleteCallback)`
- **Typical usage:**
  ```javascript
  registerBeats('criteriaBeats', CRITERIA_BEATS, CRITERIA_FINAL, 
    ()=>{ renderCriteria(); renderASAMFinalQuiz(); }, 
    ()=>!!asamProgress['criteria'])
  ```
- **Critical behavior:** Must only mark section complete after a *correct* answer, not on first attempt

#### `renderClassify(containerId, itemsArray, classPrefix, showFunctionCallback)`
- **Purpose:** Generic renderer for classification/decision exercises
- **How it works:**
  1. Renders classification prompt
  2. Renders category options as clickable cards (`.classify-row`)
  3. On selection, checks against `correctIdx`
  4. Shows explanation
  5. Calls completion callback
- **Signature:** `renderClassify(...)` — implementation varies by module
- **Used by:** `asamRenderClassify()`, `itpRenderClassify()`, etc.

**Module-specific wrappers:**
- `asamRenderClassify()` — ASAM-specific classification exercise
- `itpRenderClassify()` — ITP-specific classification exercise
- `cultRenderLensQuiz()` — Cultural Humility classification
- Many others — each module has tailored rendering logic

### Data Restoration

**On page load (bottom of script):**
```javascript
asamProgress = JSON.parse(localStorage.getItem('asamProgress')) || {};
itpProgress = JSON.parse(localStorage.getItem('itpProgress')) || {};
// ... etc for all modules

showView('view-home'); // Start on home screen
```

This restores all progress from `localStorage` before rendering begins, ensuring checkmarks and progress bar are accurate on page load.

### Module-Specific Navigation Functions

Each module has a `renderXXXNav()` function (e.g., `renderASAMNav()`):
- **Purpose:** Builds the sidebar navigation list specific to that module
- **How it works:**
  1. Creates a `<ul>` with section items
  2. Sets `.active` class on current section
  3. Sets `.nav-check.done` on completed sections
  4. Attaches click handlers to each section
  5. Inserts into sidebar

**Example structure (not actual code, for clarity):**
```javascript
function renderASAMNav(){
  const sections = ['why', 'specificity', 'dim1', 'dim2', ...];
  // Build list...
  // For each section:
  //   - Check asamProgress[sectionId]
  //   - If true, add checkmark
  //   - Attach click handler to call showView('view-asam-dim1') etc.
}
```

These functions are called by `showView()` and on page load to keep the sidebar in sync with the current view.

---

## 8. Production-Critical Behavior

### Critical Functionality (Do Not Change Without Explicit Request)

#### 1. Progress Persistence to `localStorage`
- **Behavior:** All module progress is saved to `localStorage` and restored on page load.
- **Why it matters:** If staff close their browser mid-training, they can resume where they left off. This is essential for treating Training as a practical tool, not a test they must complete in one session.
- **Preserve:** The `localStorage` keys, the JSON structure, the restoration on page load.

#### 2. Completion Badges Triggered in Same Beat
- **Behavior:** When a quiz or classification is answered correctly, the sidebar checkmark appears *immediately* in the same render cycle.
- **Why it matters:** Visual feedback is crucial. If the checkmark is delayed or appears in a later beat, users won't know they've succeeded. This was a real bug in earlier iterations.
- **Preserve:** Completion must call `markSectionComplete()` directly, not defer to a later beat.

#### 3. View-Based Routing (No URL Changes)
- **Behavior:** Navigating between modules does not change the URL. All routing is via `showView(viewId)`.
- **Why it matters:** Training is a single-page application without server-side routing. Changing this would require server changes and would break the self-contained HTML file model.
- **Preserve:** All navigation via `showView()` and sidebar click handlers.

#### 4. Beat Reveal Progressive Disclosure
- **Behavior:** Each beat is hidden until the user clicks "Next". Content is never displayed all at once.
- **Why it matters:** Progressive disclosure is a core learning principle in Training. It prevents cognitive overload and forces engagement ("click to see the next idea"). Staff approach Training with anxiety about documentation; gentle, paced reveals reduce overwhelm.
- **Preserve:** Beats must be hidden by default; "Next" buttons must be required to advance.

#### 5. Danielle Continuity Across Modules
- **Behavior:** Danielle's character, family situation, and clinical details remain consistent across all modules where she appears.
- **Why it matters:** Consistency makes the case study memorable and credible. Contradictions (e.g., saying she's single in one module, then mentioning a husband in another) undermine trust.
- **Preserve:** Danielle is single, returning to her mother's house, has no children. These facts appear in ASAM, ITP, Notes, Family Systems, Cultural Humility, and Case Walkthrough modules.

#### 6. The Golden Thread Concept
- **Behavior:** The application consistently shows that documentation is a linked chain: ASAM assessment identifies problems → ITP plans solutions → Individual Notes prove the work happened.
- **Why it matters:** This is the core teaching philosophy. It reframes documentation as *clinically necessary* rather than *bureaucratic*. If this concept is muddled or contradicted, the entire educational premise fails.
- **Preserve:** Every module that touches documentation must reinforce this chain.

### Important Functionality (Should Be Preserved Unless Explicitly Requested)

#### 1. Quiz Retry Logic
- **Behavior:** When a user answers a quiz incorrectly, they see feedback but are allowed to retry (in most modules).
- **Why it matters:** Learning requires making mistakes. Preventing retries creates frustration and makes Training feel punitive rather than educational.
- **Preserve:** Unless specifically asked to change, keep retry logic active.

#### 2. Non-Linear Module Access
- **Behavior:** Users can enter any module in any order and skip sections if they choose.
- **Why it matters:** Training is not a gatekeeping prerequisite system. It respects that staff may have different learning priorities and time constraints.
- **Preserve:** Do not add module sequencing or locks that prevent users from jumping around.

#### 3. Section-Level Progress Granularity
- **Behavior:** Progress is tracked at the section level (e.g., "Specificity" within ASAM), not module-level or question-level.
- **Why it matters:** This granularity allows staff to see which concepts they've engaged with while keeping the system simple.
- **Preserve:** Do not add finer granularity (e.g., per-beat tracking) without explicit request.

#### 4. Sidebar Sticky Positioning
- **Behavior:** The sidebar remains visible and fixed on the left as users scroll through content.
- **Why it matters:** This allows quick navigation and progress visibility even while reading long modules.
- **Preserve:** Maintain sticky positioning unless a responsive redesign is explicitly requested.

#### 5. Non-Judgmental Tone
- **Behavior:** All content, quizzes, and feedback use supportive, curious language. There are no shaming or condescending messages.
- **Why it matters:** Staff often have anxiety about "getting it wrong" in documentation. A non-judgmental tone is essential to psychological safety.
- **Preserve:** Even when explaining why an answer is incorrect, frame it as "Let's think about this..." not "That's wrong."

### Ordinary UI Behavior (May Be Changed for UX Improvement)

- Exact wording of button labels (e.g., "Next" vs. "Continue")
- Exact color shades (as long as they remain in the green/cream palette)
- Spacing and padding of components
- Font sizes (within reason; readability must be preserved)
- Hover/active states on buttons and links

---

## 9. Historical Decisions and Intent

### Decision 1: Single Self-Contained HTML File (No Build Step)

**What was decided:**
Training is deployed as a single `index.html` file with all CSS, JavaScript, and content embedded. No separate files, no build tools, no dependencies beyond Google Fonts.

**Why:**
1. **Simplicity and maintainability:** A single file is easier to version control, copy, and move.
2. **No infrastructure dependencies:** No Node.js, npm, webpack, or build process required. A facility IT admin can literally copy the file to a server.
3. **Fast loading:** Single HTTP request for the entire application (after fonts load).
4. **Offline access:** Once loaded, the entire app is in browser memory and `localStorage`, accessible even if the internet goes down.

**Behavior to preserve:**
- Do not introduce external JavaScript dependencies (no jQuery, React, etc.).
- Do not create separate CSS files.
- Keep all content and logic in the single HTML file.
- If advanced functionality is needed, implement it in vanilla JavaScript.

### Decision 2: `localStorage` Over Server Sync

**What was decided:**
Progress is saved only to the user's browser `localStorage`, not to a server. No backend, no database, no sync.

**Why:**
1. **Privacy:** No student data is transmitted or stored on a server.
2. **Simplicity:** No server-side logic needed. The app is purely client-side.
3. **Offline resilience:** Staff can use Training without internet (after initial load).
4. **Facility control:** All data stays on the individual's device; no third-party hosting concerns.

**Behavior to preserve:**
- Do not add server-side progress tracking.
- Do not add cloud sync.
- Do not add user accounts or login.
- Each device/browser has its own progress.

### Decision 3: Non-Linear, Non-Gated Learning

**What was decided:**
Users can enter any module in any order. There are no prerequisites, no mandatory sequences, no locks.

**Why:**
1. **Respect for user autonomy:** Staff may have different priorities (e.g., a new notes-taker needs to learn Notes first; a new counselor might need MI).
2. **Flexibility for onboarding:** New hires can learn what they need when they need it.
3. **No gatekeeping mentality:** Training supports learning, not compliance testing.

**Behavior to preserve:**
- Do not add module locks or prerequisites.
- Do not add mandatory module ordering.
- Keep all modules accessible from home screen.

### Decision 4: Progressive Beat Reveal

**What was decided:**
Content is revealed progressively, one beat at a time. Users click "Next" to see the next idea.

**Why:**
1. **Reduces cognitive overload:** Staff approach Training with anxiety. Seeing a wall of text is discouraging. Small chunks are less threatening.
2. **Forces engagement:** Clicking "Next" is a micro-commitment. It keeps users actively participating, not passively scrolling.
3. **Pacing control:** Users set their own pace. Some may linger on a beat, re-reading it; others may rush through.

**Behavior to preserve:**
- Do not auto-reveal all beats on page load.
- Keep "Next" buttons required to advance (don't allow scrolling to see all beats at once).
- Preserve the sense that "one beat at a time" is the intended consumption model.

### Decision 5: Danielle as Recurring Case Study

**What was decided:**
A single fictional client, Danielle, is used across multiple modules to illustrate documentation in context.

**Why:**
1. **Consistency and memory:** Seeing the same person in different documentation contexts (ASAM, ITP, Notes, Family Systems) makes the learning concrete and memorable.
2. **Reduces cognitive burden:** Rather than learning about 5 different fictional clients, staff learn about 1 person deeply.
3. **Highlights the Golden Thread:** Danielle's ASAM becomes her ITP becomes her Notes. The linkage becomes obvious.

**Behavior to preserve:**
- Maintain Danielle's consistent characterization across all modules.
- Use Danielle in ASAM, ITP, Notes, Family Systems, Cultural Humility, and Case Walkthrough.
- Document her background clearly so future edits don't introduce contradictions.

**Current canonical facts about Danielle:**
- Single (no spouse)
- Returning to mother's house (not her own home)
- No children
- Residential treatment patient at Woodhaven

### Decision 6: Gentle, Non-Preachy Tone

**What was decided:**
All content avoids moral framing or shame language. The tone is curious, supportive, and practical.

**Why:**
Staff already feel apprehensive about documentation and "getting it wrong." A preachy or judgmental tone reinforces anxiety and shame, counteracting learning. A gentle, curious tone ("Let's think about what this finding tells us...") builds psychological safety.

**Behavior to preserve:**
- No "you should" language in content.
- No phrases like "common mistake" or "incorrect thinking."
- Reframe failures to learn ("This is a gap to explore...").
- Model curiosity and openness to ambiguity.

### Decision 7: Quizzes as Learning Tools, Not Gatekeepers

**What was decided:**
Quizzes are embedded in modules to reinforce learning, not to grade or certify competency. Users can retry quizzes and can skip sections.

**Why:**
1. **Learning over compliance:** The goal is to build competency, not to prove it.
2. **Reduces test anxiety:** Staff who struggle with test-taking can still engage with the material.
3. **Mistakes as learning:** Retries allow users to learn from wrong answers through immediate feedback.

**Behavior to preserve:**
- Quizzes show explanations immediately after answering.
- Users can typically retry questions.
- No quiz scores are reported or stored.
- Failing a quiz doesn't prevent progress to other sections.

### Decision 8: Interactive Over Passive

**What was decided:**
Every module includes interactive elements (quizzes, classifications, scenarios). Pure reading is rare; content is mostly "click to reveal" or "solve this problem."

**Why:**
Engagement and retention are higher with active learning. A module that's all text is boring and easy to skim. Interactivity forces engagement.

**Behavior to preserve:**
- Avoid modules that are pure reading. Include quizzes, classifications, or scenarios.
- Interactive elements should appear naturally in content, not as separate "test yourself" sections.

### Decision 9: Clinical Content Grounded in Woodhaven Policy

**What was decided:**
All clinical content reflects Woodhaven's actual policies, procedures, and levels of care, not generic substance abuse treatment guidance.

**Why:**
Training is for Woodhaven staff. Generalizations don't stick; specificity does. "Woodhaven's Level 2.5 means..." is more useful than "some facilities use intermediate outpatient programs."

**Behavior to preserve:**
- Ground all clinical examples in Woodhaven's levels of care (1, 2.1, 2.5, 3.5, 3.7WM).
- Reference Woodhaven's actual policies where applicable (e.g., handling expressions of distress).
- Use Woodhaven-specific terminology.

---

## 10. Known Problems and Limitations

### Existing Behavior (Current Production State)

#### No Mobile-Specific Breakpoint
- **Status:** Existing behavior (not a bug, but not fully optimized)
- **Description:** The application does not have an explicit media query for mobile screens. The sidebar is sticky on all screen sizes, which may cause cramping on phones under ~480px width.
- **Impact:** Mobile users see the layout stack awkwardly; text may be hard to read.
- **Current workaround:** None documented. Mobile users can rotate to landscape or use a tablet.

#### No Search or Filter
- **Status:** Existing limitation (intentional)
- **Description:** There is no search function to find a specific beat or quiz item within a module.
- **Impact:** Users who want to revisit a specific concept must navigate through beats sequentially.
- **Why intentional:** Small module size makes search unnecessary. If modules grow beyond ~50 sections, search may be needed.

#### No Progress Export
- **Status:** Existing limitation (intentional)
- **Description:** Progress is stored only in `localStorage`. There is no way to export or backup progress.
- **Impact:** If a staff member's browser cache is cleared, progress is lost. Progress does not transfer between devices.
- **Why intentional:** No server storage means no export infrastructure. Adding it would require significant changes.

#### No Print/PDF Export
- **Status:** Existing limitation (intentional)
- **Description:** There is no way to print or export module content as PDF.
- **Impact:** Staff must view Training in-browser; they cannot save a copy.
- **Why intentional:** Training is designed to be accessed online, not printed. Paper copies would quickly become outdated.

#### No Progress Analytics
- **Status:** Existing limitation (intentional)
- **Description:** No data is collected about which modules staff use, how long they spend on each, or completion rates.
- **Impact:** Woodhaven has no visibility into training uptake or engagement.
- **Why intentional:** Privacy commitment. No data collection means no privacy risk.

#### Quizzes Allow Infinite Retries (No Attempt Limit)
- **Status:** Existing behavior (intentional)
- **Description:** Users can retry quiz questions as many times as they want.
- **Impact:** A user could click every option until they find the right answer.
- **Why intentional:** Mistakes are learning opportunities. No attempt limit removes the "test anxiety" dynamic.

#### Sidebar Scrolls Over Content on Small Screens
- **Status:** Existing behavior (acceptable, but noted)
- **Description:** On very narrow screens, the sidebar may be taller than the viewport; it scrolls independently.
- **Impact:** Content on the main area is not scrollable while the sidebar is being scrolled, which can feel awkward.
- **Current approach:** Acceptable for a desktop-first application.

### Planned/Future Features (Not Yet Implemented)

#### Conflict De-escalation and Resolution Module
- **Status:** In development (visible on home screen with muted styling)
- **Description:** A new module for Track 02 (Clinical Skills) covering client conflict de-escalation, reading escalation signals, in-the-moment techniques, mediated resolution, thresholds where de-escalation becomes a different protocol, and documentation.
- **Implementation status:** Content structure has been proposed but not built.
- **What is implemented:** Module title and placeholder on home screen; no content yet.
- **What is NOT implemented:** All beat definitions, quizzes, and rendering logic.
- **Dependency:** Awaiting Joseph's approval or reshaping of the proposed structure before content build-out.

#### Possible: Mobile Redesign
- **Status:** Not scheduled
- **Description:** If mobile usage becomes significant, a media query breakpoint and responsive layout could be added.
- **No current plans:** Assuming desktop/tablet is primary use case.

#### Possible: Progress Analytics Dashboard
- **Status:** Not scheduled
- **Description:** If Woodhaven wants to track staff training engagement, a server-side analytics system could be added. This would require significant changes to the no-server philosophy.
- **Current stance:** Not planned.

### Bugs and Workarounds

#### Known Bug: Duplicate Element IDs
- **Status:** Fixed, but remains a class of bugs to watch for
- **Description:** If two modules accidentally share the same element ID (e.g., two `.quiz-container` divs with `id="quizCard"`), DOM selectors can target the wrong element.
- **Mitigation:** Always check for duplicate IDs after adding new modules. Use a linter or manual search for duplicates.

#### Known Issue: `buildQuiz` Array Index Out of Bounds
- **Status:** Fixed, but remains a class of bugs to watch for
- **Description:** If a quiz has fewer items than expected, `buildQuiz` can fail to render all options or crash.
- **Mitigation:** Always verify that quiz items arrays match the expected count and that indices are in bounds.

---

## 11. Dependencies

### Internal Files and Code

**No external files.** Everything is in a single `index.html`.

### External Libraries and Frameworks

**Google Fonts** (only external dependency):
- IBM Plex Sans (weights: 400, 500, 600, 700, 800)
- IBM Plex Mono (weights: 400, 500)
- Loaded via `<link rel="preconnect" ... href="https://fonts.googleapis.com">` and `<link href="https://fonts.googleapis.com/css2?family=...">`
- Fallback fonts: `sans-serif` and `monospace`

### Browser APIs

- **`localStorage`** — read/write for progress persistence
- **`JSON.stringify()` / `JSON.parse()`** — serializing progress objects
- **`querySelector()` / `getElementById()` / `addEventListener()`** — standard DOM manipulation
- **`window.confirm()`** — confirmation dialog for reset
- **`location.reload()`** — page reload after reset

### Server and Infrastructure

**No server dependency.** Training is entirely client-side. Once the HTML file is loaded, it works offline.

**Deployment:** Hosted at `bretzfelder.com/training` (exact hosting infrastructure not documented in code).

### Shared Assets

**No shared assets with DocAssist.** Training is completely independent. Google Fonts are shared (both Training and DocAssist use IBM Plex Sans/Mono), but this is a third-party library, not shared code.

### Data Files

**No external data files.** All content (beats, quizzes, module definitions) is embedded as JavaScript arrays in the HTML.

---

## 12. Relationship to DocAssist

### How They Are Linked

**Cross-navigation only:** Training and DocAssist link to each other, but do not share code or data.

- Training home screen has a link to DocAssist: "Need help drafting documentation? Check out DocAssist."
- DocAssist likely has a reciprocal link to Training: "Want to understand *why* we document? Try Clinical Training."

**No structural coupling:** The two applications are independent single-page apps that happen to be hosted on the same domain.

### What They Do NOT Share

- **Navigation:** Each has its own sidebar and view switching. No shared navigation component.
- **Styling:** Each uses its own embedded CSS. Google Fonts (IBM Plex) are shared, but this is the only common dependency.
- **JavaScript:** No shared functions or logic. DocAssist has its own codebase (not analyzed in this document).
- **Assets:** No shared images or icons (though both may use similar brand colors).
- **Data:** No shared progress, no shared localStorage keys, no shared user state.
- **Infrastructure:** Each is a self-contained HTML file. No shared server logic (assumed).

### Deployment Relationship

- **URL structure:** `bretzfelder.com/training` (Training), `bretzfelder.com` or `bretzfelder.com/doctrain` (DocAssist).
- **GitHub:** Likely in the same repository, but as separate files or directories.
- **No deployment coupling:** Either can be updated independently without affecting the other.

### Explicit Design: Independence

Training was intentionally designed to be independent of DocAssist. They are complementary tools (DocAssist helps you *write* docs; Training helps you understand *why* to write them correctly), but they do not depend on each other functionally.

---

## 13. Deployment

### GitHub Repository Relationship

- **Assumption:** Training and DocAssist are in the same GitHub repository, likely in the same folder or project.
- **Not confirmed:** Exact repository structure not documented. (This should be verified in the repository README.)

### Hosting

**URL:** `bretzfelder.com/training`

**Likely deployment:** Static file hosting (GitHub Pages or similar). The single `index.html` file is served directly.

**No build step required:** The HTML file is production-ready as-is. No compilation, bundling, or minification is needed (though minification could be applied for performance).

### Relevant Deployment Configuration

- **Favicon:** Inline SVG data URI (no separate icon file needed).
- **Fonts:** CDN-loaded from Google Fonts (requires internet on first load; cached by browser thereafter).
- **No service worker:** Training does not use offline caching beyond browser cache.

### Deployment Workflow (Assumed)

1. Developer makes changes to `index.html`
2. Commits to Git
3. Pushes to GitHub
4. GitHub Pages or deployment automation rebuilds the site
5. Changes appear at `bretzfelder.com/training` within seconds

(This is a standard workflow for static sites; confirm the exact process in the repository documentation.)

---

## 14. Development Rules for Training

### Absolute Rules (Apply Universally)

1. **Preserve existing functionality** unless explicitly asked to change it. If the current behavior works, do not modify it.

2. **Make the smallest change necessary.** Do not rewrite or refactor code that is not directly involved in the requested change.

3. **Do not refactor for style.** Avoid changing working code simply because "it could be cleaner" or "it doesn't follow a pattern." Focus on the feature, not the code quality.

4. **Do not remove functionality to make a new feature easier.** If a new feature would be simpler if an old feature didn't exist, add the new feature anyway without removing the old one.

5. **Preserve existing data behavior.** Do not change how progress is saved, loaded, or stored without explicit request.

6. **Preserve existing workflows.** Users expect modules to work a certain way. Do not change the beat reveal pattern, quiz retry logic, or navigation model without explicit request.

7. **Check dependencies before changing shared functions.** Functions like `markSectionComplete()`, `updateProgress()`, and `showView()` are used throughout the codebase. Changing their signature or behavior can break multiple modules. Always search for all callers before modifying.

8. **Follow existing conventions.** If modules use a naming pattern (e.g., `renderXXXNav()`, `registerBeats()`), follow that pattern for new code. If quizzes use a specific structure (prompt, options, correctIdx, explain), use the same structure for new quizzes.

### Training-Specific Rules

1. **Beat reveal must be progressive.** Content must be hidden until the user clicks "Next". Do not show all beats at once.

2. **Completion badges must appear immediately.** When a quiz or classification is answered correctly, the sidebar checkmark must appear in the same render cycle. Do not defer it to a later beat.

3. **Maintain Danielle consistency.** If Danielle appears in a module, ensure her characterization matches other modules. She is single, returning to her mother's house, with no children.

4. **Preserve The Golden Thread concept.** Content must reinforce that ASAM → ITP → Notes is a linked chain. Do not muddy this message.

5. **Keep the tone gentle and non-preachy.** Quiz explanations, content, and feedback must avoid shame language. Frame mistakes as learning opportunities.

6. **Do not add server dependencies.** Training is client-side only. Do not add server-side progress tracking, analytics, or authentication.

7. **Do not add external JavaScript libraries.** Keep everything in vanilla JavaScript. If advanced functionality is needed, implement it from scratch.

8. **Do not change the single-file architecture.** Keep all CSS and JavaScript embedded in the HTML file. Do not split into separate files.

9. **Preserve non-linear access.** Users should be able to enter any module in any order. Do not add prerequisites or locks.

10. **Always verify quiz/classification indices are in bounds.** Before committing code with new quizzes or classifications, check that all indices in `buildQuiz()` calls are valid.

11. **Always check for duplicate element IDs.** After adding new modules or sections, search the HTML for duplicate IDs. Use unique IDs for every container.

12. **Test in the context of the full page.** New modules interact with the sidebar, progress bar, and global functions. Test the entire page after changes, not just the new module.

---

## 15. Safe Modification Strategy

### Before Changing Code

1. **Understand the requested change.**
   - What should the user see?
   - What should they be able to do?
   - What information should be saved?
   - Clarify with Joseph if the request is ambiguous.

2. **Locate the relevant implementation.**
   - If changing a module, find the module's beat definitions and rendering functions.
   - If changing navigation, find `showView()` and the sidebar rendering functions.
   - If changing progress tracking, find `markSectionComplete()` and the restoration code.

3. **Identify dependencies.**
   - Search for all calls to the function or data structure you're changing.
   - Determine whether shared code is involved.
   - Check if other modules depend on the behavior you're modifying.

4. **Determine whether shared code is involved.**
   - Functions like `markSectionComplete()`, `updateProgress()`, `showView()` are used across many modules.
   - Changing these can have wide-ranging effects.
   - If you must change shared code, search for all callers and understand the impact.

5. **Determine whether DocAssist could be affected.**
   - DocAssist is independent, so changes to Training should not affect it.
   - However, if you're changing Google Fonts (unlikely), shared hosting configuration (unlikely), or anything related to the bretzfelder.com domain, verify that DocAssist is not affected.

6. **Make the smallest appropriate change.**
   - Add new code rather than modifying existing code when possible.
   - If you must modify existing code, change only the minimum necessary.
   - Avoid refactoring working code.

### After Changing Code

1. **Review the diff.**
   - What lines changed? Why?
   - Are there any unintended changes?
   - Is any old code still there that should have been removed?

2. **Check for unintended changes.**
   - Did your editor auto-format code in an unrelated section?
   - Did you accidentally delete or modify something?
   - Search the diff for your name or the function you changed to make sure the changes are isolated.

3. **Test the requested functionality.**
   - Does the new feature work as requested?
   - Do quizzes score correctly?
   - Do beats reveal in order?
   - Does progress save to localStorage?

4. **Test related functionality.**
   - If you added a quiz, does the completion callback fire and mark the section complete?
   - If you changed navigation, does the sidebar update correctly?
   - If you added a new module, can you navigate to it from home screen?

5. **If shared code was changed, test anything else that depends on it.**
   - If you modified `markSectionComplete()`, test it across multiple modules.
   - If you changed `showView()`, test navigation in all modules.
   - If you modified beat reveal logic, test progressive disclosure in every module that uses beats.

6. **Report exactly what was changed.**
   - Provide a clear summary: "Added Conflict De-escalation module with 7 sections and 3 quizzes."
   - Explain the change, not the code details.
   - Note any new data structures or functions added.

7. **Report what was actually tested.**
   - "Tested the full Conflict De-escalation module in isolation."
   - "Tested navigation between Conflict and other Track 02 modules."
   - "Tested progress persistence; data correctly saved to localStorage and restored on page reload."
   - "Tested responsive layout on desktop and mobile."

---

## 16. Security and Privacy

### Relevant Security/Privacy Requirements

**No data transmission.** Training does not send any user data to a server. No email, no analytics, no tracking. All progress is stored locally in the user's browser `localStorage`.

**No authentication.** Training has no login, no user accounts, no passwords.

**No cookies (beyond localStorage).** Training does not use HTTP cookies for tracking or session management.

**No third-party trackers.** The only external request is to Google Fonts CDN to load IBM Plex fonts.

**Browser cache only.** If a user's browser cache is cleared, progress is lost. This is a limitation, not a bug.

**No export of sensitive data.** Do not add any feature that exports progress or user data to an external service.

### Things Never to Include in Training

- Passwords, API keys, tokens, or secrets
- Real patient names or identifiable information (Danielle is fictional)
- Real staff names or email addresses (except Joseph's public contact email in footer)
- Third-party tracking scripts (Google Analytics, Mixpanel, etc.)
- User login systems
- Payment processing
- Any code that transmits data to external servers

---

## 17. Areas Requiring Verification

The following items could not be definitively verified from the source code alone or require clarification:

### 1. Exact GitHub Repository Structure
- **Question:** Is Training in a separate file, separate folder, or in the root of the repository?
- **Current knowledge:** Assumed to be in the same repository as DocAssist, but not confirmed.
- **Action needed:** Verify the repository layout and document the path to `index.html` (Training) relative to `DocAssist`.

### 2. Exact Hosting and Deployment Process
- **Question:** How is the HTML file deployed to `bretzfelder.com/training`? Is it GitHub Pages, static hosting, or something else?
- **Current knowledge:** Assumed static file hosting, but not confirmed.
- **Action needed:** Document the deployment infrastructure and any build/publish steps.

### 3. Mobile Responsive Behavior
- **Question:** What happens on screens under 480px? How does the layout adapt?
- **Current knowledge:** No media query in the code suggests no mobile optimization, but actual behavior is untested.
- **Action needed:** Test Training on a phone and document whether any responsive changes are needed.

### 4. Browser Compatibility
- **Question:** What browsers does Training support? Are there known issues with older versions of Safari, Firefox, or Chrome?
- **Current knowledge:** No browser-specific code or fallbacks documented.
- **Action needed:** Test on a range of browsers and document supported versions.

### 5. Performance at Scale
- **Question:** How does Training perform if modules grow to 100+ sections? Will localStorage performance degrade?
- **Current knowledge:** Current code has 12 modules; scalability untested.
- **Action needed:** If modules grow significantly, test localStorage performance and consider optimization.

### 6. Danielle's Clinical Scenario Details
- **Question:** Are Danielle's ASAM findings, ITP objectives, and note content consistent across all modules? Is there a master document?
- **Current knowledge:** Danielle's background is consistent, but the clinical details (e.g., "What was her Level 1 score?") may vary.
- **Action needed:** Create a master "Danielle canonical data" document to prevent inconsistencies.

### 7. Full Module Completion Hierarchy
- **Question:** When a user completes the final beat of a module, what exactly marks the module as "complete"? Is it the final beat, or is there a module-level completion flag?
- **Current knowledge:** Progress is tracked at the section level (e.g., 'asam-specificity'). Module-level completion may not be explicitly calculated.
- **Action needed:** Clarify whether "module complete" = "all sections complete" and document this.

### 8. Conflict De-escalation Module Status
- **Question:** Has Joseph approved the proposed 7-part structure for the Conflict module, or is it still under review?
- **Current knowledge:** Structure was proposed; status is "awaiting approval or reshaping."
- **Action needed:** Get Joseph's confirmation on the structure before implementing content.

### 9. Old URL Redirect (`bretzfelder.com/doctrain`)
- **Question:** Is there a `doctrain-redirect.html` file that redirects old DocAssist URLs? Does it also redirect old Training URLs?
- **Current knowledge:** A redirect file is mentioned but not examined in detail.
- **Action needed:** Verify the redirect logic and ensure it's up-to-date.

### 10. Testing Infrastructure
- **Question:** Is there a Playwright test suite for Training? How comprehensive is it?
- **Current knowledge:** Playwright is mentioned; no test details provided.
- **Action needed:** Locate and document the test suite, including how to run it and what it covers.

### 11. Accessibility Standards
- **Question:** Does Training meet WCAG accessibility standards? Have screen readers been tested?
- **Current knowledge:** No accessibility features or testing documented.
- **Action needed:** Audit Training for accessibility and document any gaps or plans.

### 12. Font Loading and Fallbacks
- **Question:** If Google Fonts fails to load, what are the fallback fonts and how do they render?
- **Current knowledge:** Fallback fonts are specified in CSS, but the rendering quality is untested.
- **Action needed:** Test Training with fonts disabled and verify that readability is acceptable.

---

## Conclusion

This document captures the current state of the Clinical Training application as of August 2026. It synthesizes information from the source code, project history, and explicit design decisions. Future modifications should be guided by the principles and rules documented here, especially around:

- **Progressive beat reveal** and psychological safety
- **Progress persistence** via localStorage
- **The Golden Thread** concept as the core teaching thesis
- **Danielle's continuity** across modules
- **Gentle, non-preachy tone**
- **Single-file, self-contained architecture**
- **Non-linear, non-gated learning**

Any AI coding agent modifying Training should review this document, especially the sections on Production-Critical Behavior and Safe Modification Strategy, before making changes.

**Questions or clarifications should be directed to Joseph Bretzfelder** at joseph.bretzfelder@woodhavenohio.com.

---

# Combined-Agent Closing Rule

When a requested change is complete, the coding agent should summarize:

1. Which application was changed.
2. Which file(s) were changed.
3. What behavior changed.
4. What related behavior was checked for regressions.
5. What was actually tested.
6. Anything that could not be verified.

If the current repository contradicts this document, treat the repository as evidence of current implementation, flag the discrepancy, and update this `AGENTS.md` when the discrepancy reflects a genuine architectural or workflow change.
