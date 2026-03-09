# Homes England SP Prototype — Claude Code Context

## What this project is
A GOV.UK Prototype Kit project for Homes England Strategic Partnerships (SP).
It serves SP users transitioning from a legacy system called IMS (Investment Management
System). Alongside the prototype sits a custom component library that documents every
new component built for this service — modelled on the GOV.UK Design System component
pages at design-system.service.gov.uk/components/

---

## Design philosophy
- Always start with GDS foundations but iterate confidently when user needs require it
- SP users are data professionals — multi-column forms and dense pages are intentional
- One-question-per-page is NOT enforced for SP flows
- Every deviation from GDS must have an HTML comment explaining the rationale
- New components must be fully WCAG 2.1 AA compliant — in some cases exceeding GDS defaults
- Charts and data visualisations are fully buildable accessibly — do not avoid them
- Private sector influence on data, metrics and dashboards is welcome where it serves users

---

## User types
- **SP users** — used to IMS, expect editable tables, dense data entry, multiple related
  fields per page, and inline calculations. These are the primary focus of this prototype.
- **CME users** — standard GDS one-question-per-page flows. Not the focus of this prototype
  but the kit must not break CME-style pages if they are added later.

---

## Tech stack
- GOV.UK Prototype Kit 13.19.1
- GOV.UK Frontend 6.1.0
- Nunjucks templating (.html extension as per kit convention)
- Vanilla JavaScript only — no jQuery, no frameworks
- Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js@4) for all data visualisation
- Sass for all custom styles — no inline styles ever
- No build tools beyond what the prototype kit provides
- Deployed on Railway via `railway.json` at repo root

---

## Current project structure (as built)

```
homes-england-sp-prototype/
├── claude.md
├── package.json
├── app/
│   ├── config.json                          ← serviceName: "Homes England", rebrand: true
│   ├── routes.js                            ← all GET/POST routes
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.html                    ← extends govuk-branded.njk; overrides
│   │   │                                       govukServiceNavigation block for custom nav
│   │   ├── components/
│   │   │   ├── index.html                   ← component library index (8-card grid)
│   │   │   ├── accessible-chart.html        ← detail page
│   │   │   ├── date-picker.html             ← detail page
│   │   │   ├── editable-table.html          ← detail page (kebab, NOT the macro)
│   │   │   ├── editableTable.html           ← Nunjucks macro (camelCase — coexists safely)
│   │   │   ├── important-notification-banner.html
│   │   │   ├── multi-column-form.html
│   │   │   ├── role-switcher.html
│   │   │   ├── stat-card.html
│   │   │   └── year-tabs.html
│   │   ├── index.html                       ← home/prototype index page
│   │   ├── site-units-forecast.html         ← SP editable table page (main deliverable)
│   │   ├── site-units-forecast-confirmation.html
│   │   └── site-units-forecast-build-analysis.html ← GDS alignment + accessibility audit
│   ├── assets/
│   │   ├── javascripts/
│   │   │   ├── application.js               ← kit default
│   │   │   ├── editable-table.js            ← auto-calculation: remaining = forecast - actual
│   │   │   ├── year-tabs.js                 ← WAI-ARIA APG tab pattern
│   │   │   └── date-picker.js               ← calendar enhancement for date inputs
│   │   └── sass/
│   │       ├── application.scss             ← imports partials; sets max-width: 1020px
│   │       ├── _editable-table.scss         ← .sp-* styles for editable table pattern
│   │       └── _component-library.scss      ← .cl-* styles for library docs + SP components
```

---

## Navigation (current)
Home | Components

Active state controlled via `res.locals.currentPath` middleware in routes.js.
`"/components" in currentPath` (Nunjucks `in` operator) matches all /components/* pages.

---

## Current routes
| Method | Route | Handler |
|---|---|---|
| GET | `/` | kit default → `index.html` |
| GET | `/site-units-forecast` | seeds mock session data, renders forecast page |
| POST | `/site-units-forecast` | kit auto-saves POST body to session, redirects to confirmation |
| GET | `/site-units-forecast-confirmation` | kit default render |
| GET | `/site-units-forecast-build-analysis` | renders build analysis page |
| GET | `/components` | renders component library index |
| GET | `/components/accessible-chart` | |
| GET | `/components/date-picker` | |
| GET | `/components/editable-table` | seeds mock data so example table has values |
| GET | `/components/important-notification-banner` | |
| GET | `/components/multi-column-form` | |
| GET | `/components/role-switcher` | |
| GET | `/components/stat-card` | |
| GET | `/components/year-tabs` | |

Routes follow REST conventions: GET to render, POST to save, always redirect after POST.

---

## What has been built (progress to date)

### Site home forecasts page (`/site-units-forecast`)
The main prototype deliverable. An editable table page for SP users to enter home
completion forecasts per tenure type across two funding tiers.

**Structure:**
- Breadcrumbs (Sites > Site summary)
- Caption "Site 1234" + H1 "Site home forecasts"
- Tier 1 forecast table — 6 tenure rows × 4 columns
- Tier 2 forecast table — 6 tenure rows × 4 columns (same column config, different row IDs)
- Total homes forecasted — pure read-only `govuk-table` with `aria-labelledby`
- Further forecast details — community-led homes + MMC homes inputs
- Button group: Save (primary) + Build analysis (secondary)

**Columns (shared between both tier tables):**
| Column | Type | editable | calculated |
|---|---|---|---|
| Tenure type | Row header | — | — |
| Homes current forecast | Input | yes | no |
| Actual home completions | Read-only span | no | no (seeded from IMS) |
| Homes remaining | Read-only span | no | yes (forecast − actual) |

**Tenure rows (both tiers, suffixed -t1 / -t2):**
Social Rent, Affordable Rent, Specialist and supported housing for rent,
Rent to Buy, Shared Ownership, Older Persons Shared Ownership

**Tables rendered via** `editableTable` Nunjucks macro in `app/views/components/editableTable.html`

**JavaScript:** `editable-table.js` — listens on `input`/`change`, calls `recalculateRow(rowId)`
and `recalculateTotals()`. Also runs on page load. Updates `.sp-units-remaining[data-row]`
spans and `.sp-total-forecast`, `.sp-total-actual`, `.sp-total-remaining` in totals table.

### Build analysis page (`/site-units-forecast-build-analysis`)
Documents the build for accessibility review and design critique. Sections:
1. Overview
2. GDS alignment (12 items, all linked to GDS design system)
3. Custom departure (single: editable inline table pattern)
4. Implementation details (3 items flowing from the table pattern)
5. Recommended accessibility tests (12-row table: tool, what to check, predicted outcome,
   actual result — blank column for populating after real testing)

### Component library (`/components` + 8 detail pages)
8 SP custom components documented to GDS design system standard:
Accessible chart, Date picker, Editable table, Important notification banner,
Multi-column form, Role switcher, Stat card, Year tabs.

Each detail page: description, when to use, when not to use, GDS relationship,
live example, "Show HTML" details block, in-context link, accessibility notes, research.

---

## Key Sass classes

### `.sp-*` — editable table pattern (in `_editable-table.scss`)
- `.sp-table-wrapper` — `overflow-x: auto` horizontal scroll container
- `.sp-editable-table` — table root; sets `vertical-align: bottom` on `thead th`
- `.sp-tenure-type-header` — `min-width: 260px; vertical-align: middle`
- `.sp-input-cell` — `vertical-align: middle`
- `.sp-calculated-cell` — `vertical-align: middle`
- `.sp-table-input.govuk-input` — `margin-bottom: 0` (removes default stacked-form spacing)
- `.sp-units-remaining` — target for JS recalculation; has `aria-live="polite"`
- `.sp-deficit-tag` — `margin-left: govuk-spacing(1); vertical-align: middle`
- `.sp-total-forecast` / `.sp-total-actual` / `.sp-total-remaining` — totals table targets

### `.cl-*` — component library docs (in `_component-library.scss`)
- `.cl-example` — bordered/padded live example block
- `.cl-code-block pre` — dark code block for HTML source display
- `.cl-card` / `.cl-card:hover` — component index cards
- `.cl-thumbnail` — clipped live preview in index cards
- `.cl-context-example` — blue-tinted in-context example block

---

## Key data attributes (used by editable-table.js)
- `data-row="[row-id]"` — on inputs and calculated spans; links input to its row
- `data-col="forecast"` / `data-col="actual"` — on inputs and read-only spans
- `class="sp-units-remaining"` + `data-row` — calculated remaining span per row
- `class="sp-total-forecast"` / `sp-total-actual` / `sp-total-remaining` — totals

---

## Accessibility rules (non-negotiable)

### WCAG 2.1 AA — criteria most relevant to this project
- **1.3.1** Info and Relationships — table headers, form labels, landmark regions
- **1.3.2** Meaningful Sequence — DOM order must be logical without CSS (critical for
  multi-column forms — CSS Grid for layout only, DOM order stays single-column logical)
- **1.4.1** Use of Colour — trend indicators, deficit tags and status colours must always
  combine colour WITH text/symbol. Colour alone is never sufficient.
- **1.4.3** Contrast (text) — 4.5:1 minimum
- **1.4.11** Contrast (non-text) — 3:1 for inputs, chart elements, UI components
- **1.4.13** Content on Hover or Focus — chart tooltips must be dismissable with Escape
- **2.1.1** Keyboard — every interactive element operable without a mouse
- **2.4.3** Focus Order — logical tab sequence through editable tables and year tabs
- **2.4.7** Focus Visible — GDS yellow focus ring (#ffdd00) must never be suppressed.
  In Windows High Contrast Mode restore it via `@media (forced-colors: active)`
- **4.1.2** Name, Role, Value — all custom components expose correct ARIA roles and states
- **4.1.3** Status Messages — aria-live="polite" on all auto-calculated fields

### Specific rules per component type

**All inputs**
- Every input must have an associated `<label>` (via for/id) OR a descriptive `aria-label`
- aria-labels must match visible text as closely as possible for Dragon NaturallySpeaking
  compatibility — do not use internal IDs or positional descriptions like "row-2-col-3"

**Tables**
- `<th scope="col">` for column headers
- `<th scope="row">` for row headers (tenure types etc.)
- Use `<caption class="govuk-table__caption govuk-table__caption--m">` instead of an
  external `<h2>` — captions are programmatically associated with the table (WCAG 1.3.1)
- For tables that need an external heading: use `aria-labelledby` pointing to the heading's `id`
- Do NOT add `aria-label` to read-only `<span>` cells inside scoped tables — it overrides
  the natural row+column context announced by NVDA/JAWS table navigation

**Editable tables**
- Every input inside a table cell: `aria-label="[Row header] - [Column header]"`
  e.g. `aria-label="Shared Ownership - Homes current forecast"`
- Auto-calculated cells: `aria-live="polite"` so screen readers announce changes
- Deficit/negative indicators: use `govuk-tag--red` inside `<strong>` with visible
  text "Deficit" — tag sits inside the aria-live span so screen reader announces
  e.g. "−5 Deficit" naturally. No aria-hidden or visually-hidden text needed.
- `type="text" inputmode="numeric"` — NEVER `type="number"` (causes JAWS "spin button")

**Charts**
- `<canvas>` element must have `aria-hidden="true"`
- Wrap in `<figure role="figure" aria-labelledby="[caption-id]">`
- A matching data table must always be present in the DOM (not just visually —
  screen readers must be able to reach it)
- Chart colours must all pass 3:1 contrast against white background (WCAG 1.4.11)
- `animation: false` when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

**Tabs (year tabs)**
- `role="tablist"` on container
- `role="tab"` on each tab with `aria-selected`, `aria-controls`
- `role="tabpanel"` on each panel with `aria-labelledby`
- Arrow keys navigate between tabs, Enter/Space selects
- Focus moves to tab panel on selection
- No-JS fallback: all panels shown as sections

**Dynamic content**
- All auto-calculated values: `aria-live="polite"`
- Important notification banner: `aria-live="polite"`, `role="region"`,
  `aria-label="Important notification"`

---

## Assistive technology testing matrix

Every new component must be tested against all of the following before being marked done:

| Technology | Platform | Priority |
|---|---|---|
| NVDA + Chrome | Windows | P1 — test first, free to install |
| JAWS + Chrome | Windows | P1 — corporate standard |
| VoiceOver + Safari | macOS | P1 |
| Dragon NaturallySpeaking | Windows | P1 — see Dragon rules below |
| VoiceOver + Safari | iOS | P2 |
| TalkBack + Chrome | Android | P2 |
| Windows High Contrast Mode | Windows | P1 |
| 400% browser zoom | Any | P1 |
| prefers-reduced-motion | Any | P1 |
| Keyboard only (no AT) | Any | P1 |

### Dragon NaturallySpeaking — specific rules
Dragon lets users speak element names to interact. This breaks if labels don't match
what's visible on screen. Rules:

- All interactive elements must have visible text labels
- `aria-label` values must mirror visible text exactly — Dragon reads aria-label
  to generate the speakable name
- No icon-only buttons — always pair with visible text or a matching aria-label
- In editable tables: Dragon users say "click [column name]" — aria-labels must
  include the column name as it appears visually in the header
- In year tabs: Dragon users say "click 2027/2028" — tab text must exactly match
  what is visually rendered

### Windows High Contrast Mode
- Never rely on background-color or border-color alone to convey state
- GDS yellow focus ring is suppressed by High Contrast Mode — restore it:
  ```css
  @media (forced-colors: active) {
    :focus {
      outline: 3px solid ButtonText;
    }
  }
  ```
- Chart colours will be overridden — the accompanying data table becomes the only
  usable version of chart data in this mode. This is expected and acceptable.
- Add this media query to `_component-library.scss` globally, not per-component

---

## Automated testing (run before marking any component done)
- **axe DevTools** browser extension — 0 violations required
- **Lighthouse** accessibility score — 95+ required
- **WAVE** browser extension — check for contrast errors and missing labels

Automated tools catch approximately 30-40% of issues. Manual testing is always required.

---

## Manual testing checklist (per component)

**Keyboard**
- [ ] Full tab order is logical from top to bottom of page
- [ ] Focus is always visible — never disappears or jumps unexpectedly
- [ ] All interactions operable by keyboard alone
- [ ] Escape closes any expanded element (date picker, tooltips)
- [ ] Arrow keys work in tab component

**Screen reader (NVDA + Chrome minimum)**
- [ ] Each editable table cell announces row context + column context on focus
- [ ] Auto-calculated fields announce when value changes
- [ ] Charts announce the figure caption, not "image" or "canvas"
- [ ] Year tab announces: "[Year], tab, [n] of [total], selected"
- [ ] Deficit tags are read as text, not just perceived as red

**Zoom and display**
- [ ] 400% zoom — page reflows to single column, no horizontal scroll
- [ ] Multi-column forms collapse to single column on mobile and at 400%
- [ ] No elements clipped or overlapping at any zoom level

**Motion and colour**
- [ ] prefers-reduced-motion: all chart animations and tab transitions disabled
- [ ] Windows High Contrast Mode: focus rings visible, no information lost

---

## Coding standards
- Indentation: 2 spaces throughout
- No inline styles — all styles in Sass partials
- Add an HTML comment on every non-standard GDS pattern explaining:
  - What it is
  - Why it was built this way
  - Which GDS pattern it extends or replaces (if any)
- Every Nunjucks macro must have a comment block at the top listing all accepted
  parameters, their types, and whether they are required or optional
- JavaScript must work without a framework — vanilla JS only
- JavaScript files are one concern per file — do not combine unrelated functionality

---

## When adding a new component
1. Build the Nunjucks macro in `app/views/components/[name].html`
2. Add HTML comment block at top of macro: params, GDS relationship, accessibility notes
3. Create the component library detail page at `app/views/components/[component-name].html`
   following the standard structure (description, when to use, when not to use, GDS
   relationship, isolated example, in-context example, accessibility, research)
4. Add route in `app/routes.js`
5. Add card entry to component index at `app/views/components/index.html`
6. Run axe DevTools and Lighthouse — record any issues
7. Add entry to "Decisions made" section below

---

## Decisions made

### Architecture
- Chart.js chosen over D3 — better accessibility/speed tradeoff for this team's context
- Tier tables use client-side auto-calculation, not server-side — reduces round trips
  for data-entry-heavy SP workflows
- Role switcher saves to session not URL params — avoids role leaking into shared URLs
- Multi-column form layout used for Add new site — SP user research showed single-column
  increased task time significantly vs IMS. DOM order maintained for WCAG 1.3.2.
- Dragon-compatible aria-labels adopted as standard across all components — labels mirror
  visible text rather than using programmatic identifiers

### Site home forecasts page specifically
- `govuk-table__caption--m` used instead of external `<h2>` for Tier 1/2 tables —
  captions are programmatically associated with their table; standalone headings are not
- Totals table uses `aria-labelledby` pointing to an external `<h2 id>` — correct
  pattern when the heading must remain outside the table element
- `aria-label` removed from all read-only `<span>` cells — overrides table scope
  navigation in NVDA/JAWS. Table `scope` headers provide context natively.
- `govuk-tag--red` inside `<strong>` for deficit — sits inside `aria-live` span so
  screen readers announce e.g. "−5 Deficit" naturally. No extra hidden text needed.
- `type="text" inputmode="numeric"` throughout — `type="number"` causes JAWS "spin button"
- `margin-bottom: 0` on `.sp-table-input.govuk-input` — default margin designed for
  stacked form layouts creates unintended row height inside table cells
- `vertical-align: bottom` on `thead .govuk-table__header` — ensures all column headers
  sit flush to the table body regardless of line count. GDS does not set this, so additive.
- `govuk-!-margin-top-6` on Tier 1 grid row — separates H1 from first table
- Page width kept at GDS default 1020px — no custom departure claimed

### Deployment
- Railway deployment uses `railway.json` at repo root with `rootDirectory: "homes-england-sp-prototype"`
- Inner prototype `.git` folder removed to flatten into outer repo so Railway can
  access all files when cloning from GitHub
- `.claude/` folder excluded via `.gitignore` at repo root

## Stat card (metric card) component

Custom component — no GDS equivalent exists.

### What it is
A bordered card displaying a single metric with an optional label, supporting 
text, trend indicator and coloured top border. Used in the Key information 
section of the Overview page.

### Why it's custom
The GDS Design System has no stat card or metric card component. The closest 
official pattern is `govuk-summary-list`, which is designed for key-value pairs 
in form review screens — not at-a-glance dashboard metrics. Using a summary list 
here would be technically compliant but a significant usability regression for 
users scanning programme health quickly.

### Justification for GDS review
- Built entirely from GDS design tokens (colour, typography, spacing)
- Coloured top border convention is used across HMRC and ONS dashboard 
  implementations, though not formally documented in the Design System
- Meets WCAG 2.1 AA — trend indicators use shape + colour + aria-label, 
  never colour alone (WCAG 1.4.1)
- Aligns with GDS Design Principle 4 (do the hard work to make it simple) 
  and Principle 6 (this is for everyone) — the card pattern serves users 
  better than the available alternative
- Should be submitted to the GDS community as a candidate component once 
  user research has been completed on the Overview page

### Usage rules for Claude Code
- Never use colour as the only differentiator on trend badges — always 
  include ▲/▼ shape and an aria-label describing direction in words
- Alert state (red top border) reserved for actionable blockers only, 
  e.g. Payment blocked — not for general negative trends
- Cards sit in a full-width 2×3 CSS grid (`.stat-card-grid`) on the
  Overview page
- Do not add hover states or make cards clickable unless the card has a 
  clear, single destination — if clickable, the entire card must be a 
  valid focus target with a visible focus ring

### Overview page (Phase 3 redesign)
- Role selector (Customise your view) removed — single-role view simplifies
  the page; role-based personalisation can be revisited post-user-research
- Notification banner removed — no longer needed without role save confirmation
- Quick actions removed — nav sections with child links already provide direct
  task access with more context; removed to avoid duplication and reduce page length
- Layout changed from 2/3 + 1/3 grid to full-width — stat cards in a 2×3 CSS grid
  (`.stat-card-grid`), nav sections in a 2-column CSS grid (`.nav-section-grid`)
- Data insights use GDS `govuk-tabs` with 4 chart panels (Homes completed, Active
  sites, Housing outputs, Forecast vs Actual) — tabs auto-initialised by govuk-frontend
- Three data states: MVP (no data), Growing (first chart only), Mature (all four tabs)
- Inline SVG charts used instead of Chart.js — simpler, no external dependency,
  `aria-hidden="true"` with `focusable="false"`; data table always first in DOM

  - Nav section heading is conditional on data state. MVP: no heading — 
  nav sections lead the page and are self-evident. Growing/Mature: 
  "Your programme" — provides a clear break between the Key information 
  metric grid above and the navigation sections below.