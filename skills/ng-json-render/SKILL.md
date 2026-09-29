---
name: ng-json-render
description: Angular renderer for json-render (generative UI). Use when building Angular UIs from JSON specs, working with @ng-json-render/core, defining Angular component registries, writing custom components for json-render in Angular, or rendering AI-generated or server-driven specs in Angular.
---

# @ng-json-render/core

Angular renderer for [json-render](https://json-render.dev). It turns a json-render spec into native Angular components, with data binding, visibility conditions and actions. The catalog, spec format, prompts and streaming come from `@json-render/core`. This package only adds the Angular rendering layer. For catalogs and prompts, also see the upstream `core` skill (`npx skills add vercel-labs/json-render --skill core`).

## Installation

```bash
npm install @ng-json-render/core @json-render/core
npm install zod                          # only where you define a catalog (usually the server)
npm install @ng-json-render/primitives   # optional ready-made components (see the ng-json-render-primitives skill)
```

Peer dependencies: `@angular/core >=19.0.0 <23.0.0` and `@json-render/core ^0.19.0`.

## How the pieces map to Angular

| json-render concept | Angular API |
| --- | --- |
| Catalog | `defineCatalog(schema, {...})` from `@json-render/core`. The Angular package has **no** prebuilt `schema`; define one (see below). |
| Spec | `Spec` type (re-exported from `@json-render/core`) |
| Registry | `defineRegistry({ Type: AngularComponentClass })` and `mergeRegistries(a, b)`. The registry does **not** take the catalog. |
| Renderer | `<jr-renderer [spec] [registry] [state] (action)>` (the `JrRenderer` standalone component) |
| Action handlers | `provideJsonRender({ registry, actions })` and/or the `(action)` output |
| Component context | `inject(JR_CONTEXT)` or `injectJrContext()`: `{ nodeId, item, index, emit(event, payload?) }` |

There are no Angular equivalents of the React/Vue `StateProvider`, `ActionProvider`, `VisibilityProvider` or `ValidationProvider`, and no `useUIStream`. Each `<jr-renderer>` owns its own state store.

## Render a spec

```typescript
import { Component, signal } from '@angular/core';
import { JrRenderer, type JrActionEvent, type Spec } from '@ng-json-render/core';
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
  onAction(e: JrActionEvent) { console.log(e.action, e.nodeId, e.payload); }
}
```

`JrRenderer` inputs:

- `spec: Spec | null`: the spec to render. A new spec object rebuilds the tree.
- `registry: JrRegistry | null`: overrides the registry from `provideJsonRender`. With neither, it logs a warning and renders nothing.
- `state: StateModel`: merged on top of `spec.state`.

`(action)` emits a `JrActionEvent`: `{ action, payload, nodeId, element, spec }`.

Provide defaults app-wide:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideJsonRender } from '@ng-json-render/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJsonRender({
      registry,
      actions: {
        save: (ctx) => console.log(ctx.action, ctx.payload, ctx.nodeId, ctx.element),
      },
    }),
  ],
};
```

## Write a registry component

Any standalone component works, with no base class or decorator. The renderer:

- sets each resolved prop on the matching `input()` / `model()` by name (props with no matching input are ignored);
- also sets an input named `props`, if the component declares one, to the whole resolved props object;
- projects the element's `children` into `<ng-content />`, in order;
- gives each instance a `JR_CONTEXT` for raising events.

```typescript
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { JR_CONTEXT } from '@ng-json-render/core';

@Component({
  selector: 'app-pricing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3>{{ plan() }} · {{ price() }}</h3>
    <ul>@for (f of features(); track f) { <li>{{ f }}</li> }</ul>
    <ng-content />
    <button (click)="ctx.emit('select', { plan: plan() })">Choose {{ plan() }}</button>
  `,
})
export class PricingCard {
  plan = input('');
  price = input('');
  features = input<string[]>([]);
  protected ctx = inject(JR_CONTEXT);
}
```

```typescript
import { defineRegistry, mergeRegistries } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

export const registry = mergeRegistries(primitivesRegistry, defineRegistry({ PricingCard })); // later wins on conflicts
```

Add every registered type to the catalog too, or the model will never generate it.

### Events and actions

- A component calls `ctx.emit(eventName, payload?)`.
- The element's `on` map binds events to actions: `"on": { "select": { "action": "choose_plan" } }`. With no binding, the **event name** is used as the action name. For an array binding, only the first entry's `action` is used.
- The action goes to `provideJsonRender({ actions })[action]` (if registered) **and** to `(action)` on the renderer.
- `params` on an action binding are **not** resolved or passed. Send data through the emit `payload`, or read state in your handler.
- Built-in upstream actions (`setState`, `pushState`, `removeState`, `validateForm`) are **not** implemented. Handle state changes yourself or use `$bindState`.

### Two-way binding (`$bindState`)

Expose the editable value as a `model()` named after the prop (conventionally `value`, or `checked` for checkboxes). For a prop written as `{ "$bindState": "/path" }`, the renderer writes model changes back to state. This matches Signal Forms `FormValueControl` / `FormCheckboxControl`.

```typescript
@Component({
  selector: 'app-input',
  template: `<input [value]="value()" (input)="value.set($any($event.target).value)" />`,
})
export class AppInput {
  readonly value = model('');
}
```

```json
{ "type": "Input", "props": { "value": { "$bindState": "/form/email" } } }
```

State changes update only the inputs of the elements that read that state. There's no rebuild, so inputs keep focus.

## Dynamic props and visibility

These are supported through `@json-render/core`:

- **Dynamic props:** `$state`, `$bindState`, `$cond`/`$then`/`$else`, `$template` (`"Hi ${/user/name}"`).
- **Visibility:** `visible` conditions (`{ "$state": "/path", "eq": "x" }`, `$and`, `$or`, `not`, arrays for AND). They are evaluated **when the tree is built**, and **not** re-evaluated when only state changes.

Not supported yet:

- `repeat` (with `$item`, `$index` and `$bindItem`).
- `$computed` (there is no `functions` input).
- `watch`.
- Validation checks.
- Named `slots`: only `children` are projected.

## Generate specs with an AI model

1. **Catalog (server).** No Angular schema is exported, so define the flat-spec schema yourself:

```typescript
import { defineCatalog, defineSchema } from '@json-render/core';
import { z } from 'zod';

const schema = defineSchema((s) => ({
  spec: s.object({
    root: s.string(),
    elements: s.record(
      s.object({
        type: s.ref('catalog.components'),
        props: s.propsOf('catalog.components'),
        children: s.array(s.string()),
      }),
    ),
  }),
  catalog: s.object({
    components: s.map({ props: s.zod(), description: s.string() }),
    actions: s.map({ description: s.string() }),
  }),
}));

export const catalog = defineCatalog(schema, {
  components: {
    PricingCard: {
      props: z.object({ plan: z.string(), price: z.string(), features: z.array(z.string()) }),
      description: 'A pricing plan. Emits "select"; bind it with on.select',
    },
  },
  actions: { choose_plan: { description: 'The user picked a plan' } },
});
```

Use `.optional()` (not `.nullable()`) for optional props. An omitted prop keeps the Angular input's default, while an explicit `null` is set on the input as `null`.

2. **Prompt + model (server).** `catalog.prompt()` asks the model for JSONL (one RFC 6902 JSON Patch per line). The default prompt teaches `repeat`, which this renderer ignores, so add a rule against it:

```typescript
import { streamText } from 'ai';

const result = streamText({
  model: 'anthropic/claude-haiku-4.5',
  system: catalog.prompt({ customRules: ['Do not use repeat; write out each element explicitly'] }),
  prompt,
});
return result.toTextStreamResponse();
```

Validate specs on the server with `catalog.validate(spec)` (`{ success, data, error }`) or `validateSpec(spec)`.

3. **Stream into the renderer (Angular).** `createSpecStreamCompiler` buffers partial lines across chunks:

```typescript
import { signal } from '@angular/core';
import { createSpecStreamCompiler, type Spec } from '@ng-json-render/core';

readonly spec = signal<Spec | null>(null);

async generate(prompt: string) {
  const compiler = createSpecStreamCompiler<Spec>();
  const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const { result, newPatches } = compiler.push(value);
    if (newPatches.length) this.spec.set({ ...result }); // new object → re-render
  }
}
```

For a complete (non-streamed) JSONL reply, use `compileSpecStream<Spec>(text)`. A server-driven spec that is already JSON can be passed straight in, for example with `httpResource<Spec>(() => '/api/ui')`.

## Testing

```typescript
import { renderSpec } from '@ng-json-render/core/testing';

const r = renderSpec(spec, { registry, actions: { save: () => {} }, state: { name: 'Ada' } });
expect(r.query('button')?.textContent).toContain('Save');
r.query('button')?.click();
expect(r.actions.map((a) => a.action)).toEqual(['save']);
r.setSpec(nextSpec); // replace the spec and run change detection
```

`renderSpec` returns `{ fixture, host, actions, setSpec, query, queryAll }`.

## Key Exports

| Export | Purpose |
| --- | --- |
| `JrRenderer` | `<jr-renderer>`: renders a spec |
| `defineRegistry`, `mergeRegistries` | Build and combine registries (type → component class) |
| `provideJsonRender` | App/route-level default registry and action handlers |
| `JR_CONTEXT`, `injectJrContext` | Per-element context: `nodeId`, `item`, `index`, `emit` |
| `JR_REGISTRY`, `JR_ACTION_DISPATCHER` | DI tokens (advanced) |
| `JrStateStore` | The renderer's internal state store |
| `defineSchema`, `defineCatalog`, `validateSpec`, `createSpecStreamCompiler`, `compileSpecStream` | Re-exported from `@json-render/core` |
| `Spec`, `UIElement`, `JrRegistry`, `JrActionEvent`, `JrActionContext`, `JrActionHandler`, `Catalog`, `Schema` | Types |
| `renderSpec` (`@ng-json-render/core/testing`) | TestBed harness |
