# Homes England SP Prototype

A GOV.UK prototype exploring an accessible editable table pattern for Strategic Partnerships (SP) users at Homes England.

## Purpose

Strategic Partnerships is a Homes England programme through which housing associations and developers bid for funding under the [Affordable Homes Programme](https://www.gov.uk/government/news/homes-england-opens-bidding-for-ten-year-social-and-affordable-homes-programme). SP users — professional case managers working with large volumes of structured data — need to enter and review home completion forecasts across multiple tenure types and funding tiers on a single screen.

The GOV.UK Design System does not currently include a pattern for editable inline tables. This prototype explores how such a pattern can be built using standard GDS components while remaining fully WCAG 2.1 AA compliant.

## The pattern

The core contribution is an **editable inline table**: a GOV.UK table where cells contain `govuk-input` fields directly, with a read-only column that auto-calculates in real time (Homes remaining = Current forecast − Actual completions). When remaining falls below zero a `govuk-tag--red` deficit indicator appears inline.

Key accessibility decisions:

- `type="text" inputmode="numeric"` on all numeric inputs — avoids JAWS announcing "spin button" (which `type="number"` causes)
- `aria-label` on each input combining tenure type and column name, for Dragon NaturallySpeaking compatibility
- `aria-live="polite"` on calculated cells (WCAG SC 4.1.3) so screen readers announce updated values without interrupting speech
- `scope="col"` and `scope="row"` on all header cells for correct table navigation in NVDA and JAWS
- `govuk-table__caption--m` replaces an external `<h2>` so the table heading is programmatically associated with the table (WCAG 1.3.1)
- `overflow-x: auto` wrapper with `white-space: nowrap` removed — ensures WCAG 1.4.10 Reflow at 400% zoom

The pattern is implemented as a reusable Nunjucks macro (`editableTable`) following the same delivery mechanism GOV.UK Frontend uses for all its own components.

## Progress

### Completed

- **Site home forecasts page** (`/site-units-forecast`) — full editable table for Tier 1 and Tier 2 tenure types, totals summary row, further forecast details form, save confirmation flow
- **Build analysis page** (`/site-units-forecast-build-analysis`) — documents GDS alignment, the single custom departure (editable inline table pattern), implementation details, and a 12-method accessibility test plan with predicted outcomes and blank actual results columns ready for testing
- **SP component library** (`/components`) — eight custom SP component detail pages following GDS design system documentation structure, each with live examples, code snippets, accessibility notes, and usage guidance

### Components documented

| Component | Route |
|---|---|
| Accessible chart | `/components/accessible-chart` |
| Date picker | `/components/date-picker` |
| Editable table | `/components/editable-table` |
| Important notification banner | `/components/important-notification-banner` |
| Multi-column form | `/components/multi-column-form` |
| Role switcher | `/components/role-switcher` |
| Stat card | `/components/stat-card` |
| Year tabs | `/components/year-tabs` |

### Pending

- Accessibility testing with NVDA, JAWS, VoiceOver, Dragon NaturallySpeaking, axe DevTools, and WAVE
- Populating actual results in the build analysis test table

## Tech stack

- [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/) 13.19.1
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk/) 6.1.0
- Nunjucks templating
- Vanilla JavaScript (no jQuery)
- Deployed on [Railway](https://railway.app/)

## Running locally

```bash
cd homes-england-sp-prototype
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
