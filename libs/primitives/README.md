# @ng-json-render/primitives

Ready-made components for [`@ng-json-render/core`](https://www.npmjs.com/package/@ng-json-render/core),
the Angular renderer for [json-render](https://json-render.dev). You get 20
Tailwind-styled standalone components (layout, content, feedback, data-viz with
charts and a table, and Signal Forms-compatible form controls) plus
`primitivesRegistry`, so you can render specs before writing any components of
your own.

This package ships components and a registry, not a catalog. To let an AI model
generate UI with these components, list the ones you want in your own
`defineCatalog(...)`. See
[Generate UI with an AI model](https://github.com/mainawycliffe/ng-json-render#generate-ui-with-an-ai-model).

📖 [Docs & live demo](https://mainawycliffe.github.io/ng-json-render/) ·
🐙 [GitHub](https://github.com/mainawycliffe/ng-json-render) ·
🕹️ [Real-world example](https://github.com/skein-js/skein-arcade/tree/main/apps/web)

## Install

```sh
npm i @ng-json-render/primitives @ng-json-render/core @json-render/core
```

Requires Angular 19–22.

## Tailwind setup

The components are styled with **Tailwind CSS v4** utility classes. Set up
Tailwind in your app (see the
[Tailwind + Angular guide](https://tailwindcss.com/docs/installation/framework-guides/angular)),
then have it scan this package from your global stylesheet:

```css
/* src/styles.css */
@import 'tailwindcss';
@source '../node_modules/@ng-json-render/primitives';
```

## Usage

```ts
import { Component, signal } from '@angular/core';
import { JrRenderer, type Spec } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

@Component({
  selector: 'app-root',
  imports: [JrRenderer],
  template: `<jr-renderer [spec]="spec()" [registry]="registry" (action)="onAction($event)" />`,
})
export class App {
  registry = primitivesRegistry;
  spec = signal<Spec>({
    root: 'root',
    state: { name: 'Ada' },
    elements: {
      root: { type: 'Stack', props: { gap: 16 }, children: ['title', 'field', 'save'] },
      title: { type: 'Heading', props: { value: 'Hello', level: 1 } },
      field: { type: 'Input', props: { label: 'Name', value: { $bindState: '/name' } } },
      save: { type: 'Button', props: { label: 'Save' }, on: { press: { action: 'save' } } },
    },
  });
  onAction(e) { console.log(e.action, e.nodeId); }
}
```

Or provide it app-wide with `provideJsonRender({ registry: primitivesRegistry })`.
To combine it with your own components, use
`mergeRegistries(primitivesRegistry, myRegistry)`.

## Components

| Group | `type` |
| --- | --- |
| Layout | `Container` `Stack` `Grid` `Card` `Divider` |
| Content | `Heading` `Text` `Badge` `Stat` |
| Feedback | `Alert` `Progress` |
| Data-viz | `BarChart` `LineChart` `Table` |
| Forms | `Input` `Textarea` `Select` `Checkbox` `Switch` `Button` |

The [project README](https://github.com/mainawycliffe/ng-json-render#built-in-components-ng-json-renderprimitives)
lists the props for each component.
