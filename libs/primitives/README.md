# @ng-json-render/primitives

20 Tailwind-styled components and `primitivesRegistry` for [`@ng-json-render/core`](https://www.npmjs.com/package/@ng-json-render/core). Ships no catalog; to let a model use these components, add them to your own `defineCatalog(...)`.

[Docs](https://mainawycliffe.github.io/ng-json-render/components) · [GitHub](https://github.com/mainawycliffe/ng-json-render)

## Install

```sh
npm i @ng-json-render/primitives @ng-json-render/core @json-render/core
```

Requires Angular 19–22 and Tailwind CSS v4 ([setup](https://tailwindcss.com/docs/installation/framework-guides/angular)). Add the package to Tailwind's sources:

```css
/* src/styles.css */
@import 'tailwindcss';
@source '../node_modules/@ng-json-render/primitives';
```

## Usage

```ts
provideJsonRender({ registry: primitivesRegistry });
// or combine with your own components:
mergeRegistries(primitivesRegistry, defineRegistry({ MyCard }));
```

## Components

| Group | Type | Main props |
| --- | --- | --- |
| Layout | `Container` | `maxWidth` |
| | `Stack` | `direction` (`row` \| `column`), `gap`, `align`, `justify`, `wrap` |
| | `Grid` | `columns`, `gap`, `minItemWidth` |
| | `Card` | `title`, `subtitle` |
| | `Divider` | none |
| Content | `Heading` | `value`, `level` (1–4) |
| | `Text` | `value`, `weight`, `size` |
| | `Badge` | `label`, `tone` |
| | `Stat` | `label`, `value`, `delta` (percentage number) |
| Feedback | `Alert` | `title`, `message`, `tone` |
| | `Progress` | `value` (0–100), `label` |
| Data | `BarChart` | `data: { label, value }[]`, `height` |
| | `LineChart` | `data: number[]`, `height` |
| | `Table` | `columns`, `rows` |
| Forms | `Input` | `value` (model), `label`, `placeholder`, `type`, `hint` |
| | `Textarea` | `value` (model), `label`, `placeholder`, `rows` |
| | `Select` | `value` (model), `label`, `placeholder`, `options` |
| | `Checkbox`, `Switch` | `checked` (model), `label` |
| | `Button` | `label`, `variant`, `disabled`; emits `press` |

Bind form values with `{ "$bindState": "/path" }`. The [primitives skill](https://github.com/mainawycliffe/ng-json-render/blob/main/skills/ng-json-render-primitives/SKILL.md) lists every prop type and default, and includes a catalog you can copy.
