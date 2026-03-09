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
- GOV.UK Prototype Kit (latest)
- Nunjucks templating (.html extension as per kit convention)
- Vanilla JavaScript only — no jQuery, no frameworks
- Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js) for all data visualisation
- Sass for all custom styles — no inline styles ever
- No build tools beyond what the prototype kit provides

---

## Project structure
```
homes-england-sp-prototype/
├── CLAUDE.md
├── app/
│   ├── routes.js                          ← all routes
│   ├── views/
│   │   ├── layouts/
│   │   │   └── homes-england.html         ← shared layout with primary nav
│   │   ├── components/
│   │   │   ├── index.html                 ← component library index page
│   │   │   ├── [component-name].html      ← one detail page per component
│   │   │   ├── statCard.html              ← Nunjucks macro
│   │   │   ├── accessibleChart.html       ← Nunjucks macro
│   │   │   ├── editableTable.html         ← Nunjucks macro
│   │   │   ├── yearTabs.html              ← Nunjucks macro
│   │   │   ├── importantBanner.html       ← Nunjucks macro
│   │   │   └── roleSwitcher.html          ← Nunjucks macro
│   │   ├── overview.html
│   │   ├── add-new-site-step-1.html
│   │   ├── add-new-site-step-2.html
│   │   ├── site-home-forecasts.html
│   │   └── forecasting.html
│   ├── assets/
│   │   ├── javascripts/
│   │   │   ├── editable-table.js          ← table calculations and aria-live updates
│   │   │   ├── cash-forecasts.js          ← variance and yearly total calculations
│   │   │   ├── tabs.js                    ← ARIA APG tab pattern implementation
│   │   │   ├── charts.js                  ← Chart.js initialisation
│   │   │   └── role-switcher.js           ← overview role switching
│   │   └── sass/
│   │       ├── application.scss           ← imports all partials
│   │       ├── _custom.scss               ← all custom component styles
│   │       └── _component-library.scss    ← component library page styles
│   └── docs/
│       └── accessibility-notes.md         ← rationale for every custom component
```

---

## Navigation (all pages)
Overview | Agreed provider profile | Sites | Forecasting |
Quarterly Expenditure | Payments | Components | Sign out

Service name shown bold left: **Homes England**
Active nav item: bottom border underline in GDS blue (#1d70b8)
Mobile: collapses using govuk-header pattern

---

## Key routes
| Route | Description |
|---|---|
| GET /overview | Dashboard — role switcher controls view (default: Administrator) |
| POST /overview/save-role | Saves chosen role to session, redirects to /overview |
| GET /components | Component library index |
| GET /components/[name] | Individual component detail page |
| GET /add-new-site-step-1 | Step 1 of add new site flow |
| POST /add-new-site-step-1 | Save step 1 data, redirect to step 2 |
| GET /add-new-site-step-2 | Step 2 of add new site flow |
| POST /add-new-site-step-2 | Save step 2 data, redirect to confirmation |
| GET /site-home-forecasts | Editable tier forecast table |
| POST /site-home-forecasts | Save forecast data, redirect to confirmation |
| GET /forecasting | Cash forecasts with year tabs |

Routes follow REST conventions: GET to render, POST to save, always redirect after POST.

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
- Summary/total rows must be marked with appropriate scope or headers attribute

**Editable tables**
- Every input inside a table cell: `aria-label="[Row header], [Column header]"`
  e.g. `aria-label="Shared Ownership, Homes Current Forecast"`
- Auto-calculated cells: `aria-live="polite"` so screen readers announce changes
- Deficit/negative indicators: use `govuk-tag--red` with visible text ("Deficit"),
  never colour alone

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
- Add this media query to `_custom.scss` globally, not per-component

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
6. Document accessibility behaviour and test results in `app/docs/accessibility-notes.md`
7. Run axe DevTools and Lighthouse — record scores in accessibility-notes.md
8. Add entry to "Decisions made" section below

---

## Decisions made
- Chart.js chosen over D3 — better accessibility/speed tradeoff for this team's context
- Tier tables use client-side auto-calculation, not server-side — reduces round trips
  for data-entry-heavy SP workflows
- Role switcher saves to session not URL params — avoids role leaking into shared URLs
- Multi-column form layout used for Add new site — SP user research showed single-column
  increased task time significantly vs IMS. DOM order maintained for WCAG 1.3.2.
- Simultaneous chart + data table layout used on Programme Manager overview — showing
  both at once is a deliberate accessibility enhancement, not a deviation
- Dragon-compatible aria-labels adopted as standard across all components — labels mirror
  visible text rather than using programmatic identifiers
- forced-colors media query added globally — not per-component, to ensure consistent
  High Contrast Mode support across all interactive elements