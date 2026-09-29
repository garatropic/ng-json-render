---
name: ng-json-render-primitives
description: Ready-made Tailwind components and registry for the Angular json-render renderer. Use when working with @ng-json-render/primitives, primitivesRegistry, writing json-render specs for Angular that use Stack/Grid/Card/Stat/BarChart/Table/Input/Button etc., or building a catalog for these components.
---

# @ng-json-render/primitives

20 Tailwind-styled, dark-mode-ready standalone components plus `primitivesRegistry`, for `@ng-json-render/core` (see the `ng-json-render` skill). The package ships **components and a registry, not a catalog**. To let an AI model use them, list them in your own `defineCatalog(...)`; a ready-to-copy catalog is below.

## Installation

```bash
npm install @ng-json-render/primitives @ng-json-render/core @json-render/core
```

The components use **Tailwind CSS v4** classes. The app must run Tailwind and scan the package, or the components render unstyled:

```css
/* src/styles.css */
@import 'tailwindcss';
@source '../node_modules/@ng-json-render/primitives';
```

## Usage

```typescript
import { provideJsonRender, mergeRegistries, defineRegistry } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

provideJsonRender({ registry: primitivesRegistry });
// or combine with your own components (later wins on conflicts):
const registry = mergeRegistries(primitivesRegistry, defineRegistry({ PricingCard }));
```

## Components

In the tables below, `children` means the component projects its spec `children` via `<ng-content>`.

| `type` | Props (default) | Notes |
| --- | --- | --- |
| `Container` | `maxWidth: number \| string` (960) | Centered, max-width wrapper. Children |
| `Stack` | `direction: 'row' \| 'column'` ('column'), `gap: number \| string` (12, number = px), `align?: string`, `justify?: string`, `wrap: boolean` (false) | Flexbox. `align`/`justify` are CSS `align-items`/`justify-content` values. Children |
| `Grid` | `columns: number` (2), `gap: number \| string` (16), `minItemWidth: number` (200) | Responsive; drops columns below `minItemWidth` px. Children |
| `Card` | `title?: string`, `subtitle?: string` | Bordered panel. Children |
| `Divider` | none | Horizontal rule |
| `Heading` | `value: string`, `level: 1 \| 2 \| 3 \| 4` (2) | |
| `Text` | `value: string`, `weight: 'normal' \| 'medium' \| 'bold'`, `size: 'xs' \| 'sm' \| 'base' \| 'lg'` ('base') | |
| `Badge` | `label: string`, `tone: 'neutral' \| 'success' \| 'warning' \| 'danger' \| 'info'` | |
| `Stat` | `label: string`, `value: string \| number`, `delta: number \| null` | `delta` is a **percentage number** (e.g. `12.5`, `-3`), shown as ▲/▼ n% |
| `Alert` | `title?: string`, `message: string`, `tone: 'info' \| 'success' \| 'warning' \| 'danger'` ('info') | |
| `Progress` | `value: number` (0–100, clamped), `label?: string` | |
| `BarChart` | `data: { label: string; value: number }[]`, `height: number` (160) | CSS bars, no chart library |
| `LineChart` | `data: number[]`, `height: number` (120), `label?: string` | SVG line, **plain numbers** only. `label` is the accessible name; without it the chart is hidden from screen readers |
| `Table` | `columns: (string \| { key: string; label?: string })[]`, `rows: Record<string, unknown>[]` | Cells are read by column `key` |
| `Input` | `value: string` (model), `label?`, `placeholder`, `type: 'text' \| 'email' \| 'password' \| 'number'`, `hint?` | Bind `value` with `$bindState` |
| `Textarea` | `value: string` (model), `label?`, `placeholder`, `rows: number` (3) | Bind `value` |
| `Select` | `value: string` (model), `label?`, `placeholder?`, `options: (string \| { value: string; label?: string })[]` | Bind `value` |
| `Checkbox` | `checked: boolean` (model), `label: string` | Bind `checked` |
| `Switch` | `checked: boolean` (model), `label: string` | Bind `checked` |
| `Button` | `label: string`, `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'` ('primary'), `disabled: boolean` | Emits **`press`** (no payload). Bind with `"on": { "press": { "action": "..." } }` |

Form controls expose `value`/`checked` as a `model()`, so `{ "$bindState": "/path" }` binds them to state in both directions. On Angular 21+ they also work with the Signal Forms `[formField]` directive (`[field]` in early 21 releases).

## Example spec

```json
{
  "root": "page",
  "state": { "range": "7d", "notify": true },
  "elements": {
    "page": { "type": "Stack", "props": { "gap": 16 }, "children": ["kpis", "chart", "controls"] },
    "kpis": { "type": "Grid", "props": { "columns": 2, "gap": 12 }, "children": ["signups", "churn"] },
    "signups": { "type": "Stat", "props": { "label": "Signups", "value": "1,204", "delta": 12.5 }, "children": [] },
    "churn": { "type": "Stat", "props": { "label": "Churn", "value": "2.1%", "delta": -0.4 }, "children": [] },
    "chart": { "type": "Card", "props": { "title": "Signups per day" }, "children": ["bars"] },
    "bars": { "type": "BarChart", "props": { "data": [{ "label": "Mon", "value": 120 }, { "label": "Tue", "value": 180 }] }, "children": [] },
    "controls": { "type": "Stack", "props": { "direction": "row", "gap": 12, "align": "center" }, "children": ["range", "notify", "export"] },
    "range": { "type": "Select", "props": { "label": "Range", "value": { "$bindState": "/range" }, "options": [{ "value": "7d", "label": "Last 7 days" }, { "value": "30d", "label": "Last 30 days" }] }, "children": [] },
    "notify": { "type": "Switch", "props": { "label": "Email me", "checked": { "$bindState": "/notify" } }, "children": [] },
    "export": { "type": "Button", "props": { "label": "Export", "variant": "secondary" }, "on": { "press": { "action": "export_data" } }, "children": [] }
  }
}
```

## Catalog for the primitives

Copy the entries you want into your catalog (server-side; see the `ng-json-render` skill for the `schema`). Keep this in sync with the registry: types that are in the catalog but not the registry render nothing.

```typescript
import { z } from 'zod';

const tone = z.enum(['info', 'success', 'warning', 'danger']);

export const primitivesCatalogComponents = {
  Container: { props: z.object({ maxWidth: z.union([z.number(), z.string()]).optional() }), description: 'Centered max-width page wrapper' },
  Stack: {
    props: z.object({
      direction: z.enum(['row', 'column']).optional(),
      gap: z.number().optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
      justify: z.enum(['start', 'center', 'end', 'space-between']).optional(),
      wrap: z.boolean().optional(),
    }),
    description: 'Lays out children in a row or column (default column). gap is in px',
  },
  Grid: { props: z.object({ columns: z.number().optional(), gap: z.number().optional(), minItemWidth: z.number().optional() }), description: 'Responsive grid of children' },
  Card: { props: z.object({ title: z.string().optional(), subtitle: z.string().optional() }), description: 'Bordered panel that groups its children' },
  Divider: { props: z.object({}), description: 'Horizontal separator' },
  Heading: { props: z.object({ value: z.string(), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional() }), description: 'Section heading' },
  Text: { props: z.object({ value: z.string(), weight: z.enum(['normal', 'medium', 'bold']).optional(), size: z.enum(['xs', 'sm', 'base', 'lg']).optional() }), description: 'Paragraph text' },
  Badge: { props: z.object({ label: z.string(), tone: z.enum(['neutral', 'success', 'warning', 'danger', 'info']).optional() }), description: 'Small status label' },
  Stat: { props: z.object({ label: z.string(), value: z.union([z.string(), z.number()]), delta: z.number().optional() }), description: 'A KPI. delta is a percentage change, e.g. 12.5 or -3' },
  Alert: { props: z.object({ title: z.string().optional(), message: z.string(), tone: tone.optional() }), description: 'Inline status message' },
  Progress: { props: z.object({ value: z.number(), label: z.string().optional() }), description: 'Progress bar, value 0-100' },
  BarChart: { props: z.object({ data: z.array(z.object({ label: z.string(), value: z.number() })), height: z.number().optional() }), description: 'Bar chart of labelled values' },
  LineChart: { props: z.object({ data: z.array(z.number()), height: z.number().optional(), label: z.string().optional() }), description: 'Line chart of a numeric series (numbers only, no labels)' },
  Table: {
    props: z.object({
      columns: z.array(z.union([z.string(), z.object({ key: z.string(), label: z.string().optional() })])),
      rows: z.array(z.record(z.string(), z.unknown())),
    }),
    description: 'Data table; each row is an object keyed by column key',
  },
  Input: { props: z.object({ value: z.string(), label: z.string().optional(), placeholder: z.string().optional(), type: z.enum(['text', 'email', 'password', 'number']).optional(), hint: z.string().optional() }), description: 'Text field. Bind value with { "$bindState": "/path" }' },
  Textarea: { props: z.object({ value: z.string(), label: z.string().optional(), placeholder: z.string().optional(), rows: z.number().optional() }), description: 'Multi-line text. Bind value with $bindState' },
  Select: { props: z.object({ value: z.string(), label: z.string().optional(), placeholder: z.string().optional(), options: z.array(z.union([z.string(), z.object({ value: z.string(), label: z.string().optional() })])) }), description: 'Dropdown. Bind value with $bindState' },
  Checkbox: { props: z.object({ checked: z.boolean(), label: z.string() }), description: 'Checkbox. Bind checked with $bindState' },
  Switch: { props: z.object({ checked: z.boolean(), label: z.string() }), description: 'Toggle. Bind checked with $bindState' },
  Button: { props: z.object({ label: z.string(), variant: z.enum(['primary', 'secondary', 'ghost', 'danger']).optional(), disabled: z.boolean().optional() }), description: 'Button. Emits "press"; bind it with on.press to an action' },
};
```

Optional props use `.optional()`, not `.nullable()`, on purpose. A prop the model leaves out keeps the component's default. An explicit `null` is set on the input as `null`, which drops the default (for example, `Stack` with `direction: null` lays out as a row, and `gap: null` removes the gap). If your LLM provider's structured output mode requires `.nullable()`, strip `null` props from the spec before rendering.
