# @ng-json-render/core

**Generative UI for Angular.** The Angular renderer for
[json-render](https://json-render.dev): an AI model (or your server) describes a
UI as a JSON **spec**, using only the components and actions listed in your
**catalog**, and this package renders it with your own **native Angular
components**. No iframes, no `eval`, no generated code.

`@json-render/core` provides the framework-agnostic parts: catalogs, prompts,
specs, streaming and expression evaluation. This package adds the Angular
rendering layer: signals, standalone components, dynamic instantiation and
DI-based events.

New to generative UI? Read [Why this exists](https://github.com/mainawycliffe/ng-json-render#why-this-exists)
and [Generate UI with an AI model](https://github.com/mainawycliffe/ng-json-render#generate-ui-with-an-ai-model).

📖 [Docs & live demo](https://mainawycliffe.github.io/ng-json-render/) ·
🐙 [GitHub](https://github.com/mainawycliffe/ng-json-render) ·
🕹️ [Real-world example](https://github.com/skein-js/skein-arcade/tree/main/apps/web)

## Install

```sh
npm i @ng-json-render/core @json-render/core

# optional: ready-made Tailwind components and a registry for them
npm i @ng-json-render/primitives
```

Requires Angular 19–22. `@ng-json-render/primitives` also needs Tailwind CSS v4
to scan the package; see the
[installation guide](https://github.com/mainawycliffe/ng-json-render#installation).

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
    elements: {
      root: { type: 'Stack', props: { gap: 16 }, children: ['title', 'save'] },
      title: { type: 'Text', props: { value: 'Hello', weight: 'bold' } },
      save: { type: 'Button', props: { label: 'Save' }, on: { press: { action: 'save' } } },
    },
  });
  onAction(e) { console.log(e.action, e.nodeId); }
}
```

## Authoring components

Any standalone component can be registered. Props map to discrete
`input()`s, children go through `<ng-content>`, and events are raised via the
injected `JR_CONTEXT`:

```ts
import { Component, inject, input } from '@angular/core';
import { JR_CONTEXT } from '@ng-json-render/core';

@Component({
  selector: 'jr-button',
  template: `<button (click)="ctx.emit('press')">{{ label() }}<ng-content /></button>`,
})
export class MyButton {
  label = input('');
  protected ctx = inject(JR_CONTEXT);
}
```

Register it with `defineRegistry({ Button: MyButton })` and pass to `<jr-renderer>`
or `provideJsonRender({ registry })`.

## Data binding

Props support the full `@json-render/core` expression language — `$state`
paths, `$cond/$then/$else`, `$template`, and directives — resolved against the
spec's `state`. Provide/override state via the `[state]` input.

## Testing

`@ng-json-render/core/testing` exports a `renderSpec()` harness for TestBed:

```ts
import { renderSpec } from '@ng-json-render/core/testing';

const r = renderSpec(spec, { registry });
expect(r.query('button')?.textContent).toContain('Save');
```

## Status

Implemented: the renderer engine, granular reactivity, data binding, actions,
and two-way Signal Forms binding (`$bindState`). Streaming
(`injectUiStream()`), `$item/$index` repeat, and a broader catalog are on the
roadmap.
