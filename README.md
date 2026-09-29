# ng-json-render

**Generative UI for Angular.** Let an AI model (or your server) describe a UI as JSON, and render that JSON as your own native Angular components. No iframes, no `eval`, no generated code.

📖 **Docs & live demo:** [mainawycliffe.github.io/ng-json-render](https://mainawycliffe.github.io/ng-json-render/)\
🐙 **GitHub:** [github.com/mainawycliffe/ng-json-render](https://github.com/mainawycliffe/ng-json-render)\
🕹️ **Real-world example:** [skein-arcade web app](https://github.com/skein-js/skein-arcade/tree/main/apps/web)

ng-json-render is the Angular renderer for [json-render](https://json-render.dev) by Vercel Labs. It uses the same catalogs, specs and prompts as the other json-render renderers. Only the rendering layer is Angular.

## Why this exists

Imagine you are building an analytics assistant. A user types: *"Show me last week's signups next to churn, and let me change the date range."*

A chatbot answers with a paragraph of text. That is fine, but the user wanted **a UI**: two stat cards, a chart and a date picker they can click. Each question needs a different screen, and you can't design every screen ahead of time.

So you ask the model to build the screen. The obvious approaches don't hold up:

- **Let the model write HTML or Angular code.** You would run untrusted, unreviewed code in your app. It can break your layout, ignore your design system, invent APIs, or run scripts. It is also hard to stream and impossible to validate.
- **Render the model's HTML in an iframe.** Now it is isolated, but it doesn't look or behave like your app. It can't use your components, your state or your services.
- **Hard-code a few screens and let the model pick one.** Safe, but not generative. You are back to designing every screen yourself.

json-render takes a middle path, and that path is **Generative UI**: *the AI generates the interface itself (which components to show, how to arrange them, what data to bind, what actions to wire up), but only from building blocks you approved.*

1. **You define a catalog.** The catalog lists the components (`Card`, `BarChart`, `Button`, …) and actions (`save`, `export_data`, …) that the AI may use, with typed props. It is the contract between your app and the AI, and the AI's guardrail.
2. **The AI writes a spec.** A spec is plain JSON: a flat tree of typed elements with props, children and data bindings. It is data, not code, so you can validate it, store it, diff it and stream it.
3. **Your app renders the spec.** A registry maps each catalog type to a real component. On the web with React that is a React component. **With ng-json-render, it is your Angular component.** The renderer builds the UI from those components, so the result looks and behaves like the rest of your app.

The model decides *what* to show. You decide *what it is allowed to show* and *how each piece looks and behaves*. If the model makes up a component that isn't in your catalog, validation catches it and the renderer skips it. Nothing the model writes is ever executed.

The same idea also works without AI. A **server-driven UI** is a spec that your backend builds, for example a form definition, a CMS page or a per-tenant dashboard. ng-json-render renders both kinds the same way.

## Core concepts

These are json-render's terms. You will see them throughout these docs and the [upstream docs](https://json-render.dev/docs).

| Term | What it is | In ng-json-render |
| --- | --- | --- |
| **Catalog** | The components, actions and validation functions the AI can use. The contract between your app and the AI. | `defineCatalog(schema, { components, actions })`, usually on your server, where you build the prompt |
| **Spec** | The JSON the AI generates: a flat tree of typed **elements**, each with a `type`, `props` and `children`, plus a `root` and optional `state`. | The `Spec` type, passed to `<jr-renderer [spec]>` |
| **Registry** | Maps catalog types to platform-specific components. | `defineRegistry({ Card: MyCard })`; `primitivesRegistry` is a ready-made one |
| **Renderer** | Renders a spec using a registry. | The `<jr-renderer>` component |
| **Data binding** | Props that read (`$state`) or read and write (`$bindState`) values in the spec's state. | Bound props update in place; `$bindState` binds to an Angular `model()` |
| **Actions** | Named operations that components trigger. The AI wires them up; your code runs them. | Components call `emit()`; you handle it in `provideJsonRender({ actions })` or `(action)` |
| **Streaming** | Rendering progressively as the AI responds. | Compile the model's JSONL patches into a spec signal |

```text
 you define            the AI generates         your app renders
┌───────────┐ prompt ┌──────────────┐  spec   ┌───────────────┐ registry ┌─────────────────────┐
│  Catalog  │──────▶ │  LLM / server │───────▶ │ <jr-renderer> │────────▶ │ your Angular         │
│ (the rules)│        └──────────────┘ (JSON)  └───────────────┘          │ components           │
└───────────┘                                                              └─────────────────────┘
```

> **Angular compatibility:** `@ng-json-render/core` and `@ng-json-render/primitives` support **Angular 19, 20, 21 and 22** (peer range `>=19.0.0 <23.0.0`). This workspace runs on Angular 21.

## Packages

| Package | Description |
| --- | --- |
| [`@ng-json-render/core`](libs/core) | The renderer (`JrRenderer`) and the Angular glue: `defineRegistry`, `provideJsonRender`, `JR_CONTEXT`, data binding and actions. It also re-exports `defineSchema`, `defineCatalog`, `validateSpec` and the streaming compiler from `@json-render/core`. |
| [`@ng-json-render/core/testing`](libs/core/testing) | A `renderSpec()` TestBed harness (secondary entry point). |
| [`@ng-json-render/primitives`](libs/primitives) | 20 Tailwind-styled components (layout, content, feedback, charts/table and Signal Forms controls) plus `primitivesRegistry`, so you can render specs without writing any components first. |
| [`apps/demo`](apps/demo) | The docs site, including an analytics dashboard rendered entirely from one spec. |

## Installation

Install the renderer and its required peer, [`@json-render/core`](https://www.npmjs.com/package/@json-render/core) (`^0.19.0`):

```sh
npm i @ng-json-render/core @json-render/core

# optional: ready-made Tailwind components and a registry for them
npm i @ng-json-render/primitives

# only if you build a catalog/prompt (usually on your server)
npm i zod
```

(Or use `pnpm add` / `yarn add`.) Your app must be on **Angular 19–22**.

### Tailwind setup (only for `@ng-json-render/primitives`)

The primitives are styled with **Tailwind CSS v4** utility classes, so your app needs to run Tailwind and scan the package for those classes. If Tailwind isn't set up yet, follow the [Tailwind + Angular guide](https://tailwindcss.com/docs/installation/framework-guides/angular) (`tailwindcss`, `@tailwindcss/postcss`, `.postcssrc.json`), then add an `@source` for the package to your global stylesheet:

```css
/* src/styles.css */
@import 'tailwindcss';

/* Scan the primitives package for the utility classes used in its templates. */
@source '../node_modules/@ng-json-render/primitives';
```

Adjust the relative path if your stylesheet is not in `src/` (in a monorepo, point it to the `node_modules` folder that holds the package).

## Getting started

Start without any AI: write a spec by hand, render it, and see how the pieces connect. Once that works, [let a model write the spec](#generate-ui-with-an-ai-model).

### 1. Provide a registry app-wide (optional)

Register a default registry, plus any action handlers, in `app.config.ts`. Every `<jr-renderer>` without its own `[registry]` uses it:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideJsonRender } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

export const appConfig: ApplicationConfig = {
  providers: [
    provideJsonRender({
      registry: primitivesRegistry,
      actions: {
        save: (ctx) => console.log('save', ctx.payload),
      },
    }),
  ],
};
```

### 2. Render a spec

Import `JrRenderer` and pass it a spec. The `[registry]` input is optional if you set one up in step 1:

```ts
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
      save:  { type: 'Button', props: { label: 'Save' }, on: { press: { action: 'save' } } },
    },
  });
  onAction(e: JrActionEvent) { console.log(e.action, e.nodeId); }
}
```

Reading the spec:

- `root` names the element to start from. `elements` is a **flat map**: each element lists its `children` by key instead of nesting them. Flat specs are easier for a model to stream, one element at a time.
- `type` must be a key in the registry. `props` become the component's inputs.
- `state` is the spec's data. `{ "$bindState": "/name" }` binds the input to `state.name` in both directions, so typing updates state.
- `on: { press: { action: 'save' } }` means that when the Button emits `press`, the `save` action runs.

### 3. Handle actions and add your own components

Every action a component raises is emitted on the renderer's `(action)` output. Actions are also routed to the handlers you registered with `provideJsonRender({ actions })`. Actions are how generated UI talks back to your app: the spec only *names* an action, and your code decides what it does.

Next steps: render [your own components](#custom-components), [load specs from a server](#server-driven-fetch-a-spec), or [generate them with an AI model](#generate-ui-with-an-ai-model).

## Generate UI with an AI model

If you are new to generative UI, this is the part to read. Here is the whole loop:

```text
user prompt ─▶ your server: catalog.prompt() + LLM ─▶ JSONL patches ─▶ browser: compile into a spec ─▶ <jr-renderer>
```

### How to approach it

- **Start from the UI you want, not from the model.** Hand-write two or three specs for real screens first. If you can't express a screen with your components, the model can't either.
- **Keep the catalog small and well described.** Every component and prop you add is something the model can get wrong. The `description` of each component is the model's only documentation, so write it like one.
- **Make the catalog match the registry.** The catalog tells the model what exists; the registry tells Angular how to draw it. A type that is in one but not the other either renders nothing or can never be generated.
- **Keep actions as intents.** The model should say *what* the user wants (`export_data`, `choose_plan`). Your action handlers decide *how*, and they check permissions. Never let a spec carry URLs, queries or code for you to run.
- **Validate before you trust.** Use `catalog.validate(spec)` on the server (or `validateSpec`) and show a fallback when validation fails.
- **Stream.** The model outputs one JSON patch per line, and you can render after every line, so users see the UI appear instead of waiting on a spinner.

### 1. Define a catalog (server)

The catalog lists the components your registry can render, with [Zod](https://zod.dev) props and a description for each. The schema describes the flat spec format that ng-json-render renders.

```ts
// server/catalog.ts
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
    Stack: {
      props: z.object({ gap: z.number().optional(), direction: z.enum(['row', 'column']).optional() }),
      description: 'Lays out its children in a row or column',
    },
    Stat: {
      props: z.object({ label: z.string(), value: z.union([z.string(), z.number()]), delta: z.number().optional() }),
      description: 'A single KPI. delta is a percentage change, e.g. 12.5 or -3',
    },
    Button: {
      props: z.object({ label: z.string() }),
      description: 'A button. Emits "press"; bind it to an action with on.press',
    },
  },
  actions: {
    export_data: { description: 'Export the data currently on screen' },
  },
});
```

`@ng-json-render/primitives` ships the components and registry but not a catalog, so list the primitives you want the model to use in your own catalog, as above. Their props are in the [component table](#built-in-components-ng-json-renderprimitives).

### 2. Build the prompt and call the model (server)

`catalog.prompt()` generates a system prompt that describes the spec format, your components and your actions. It asks the model to answer with **JSONL**: one [JSON Patch](https://datatracker.ietf.org/doc/html/rfc6902) operation per line. Use any LLM SDK; here is the [AI SDK](https://ai-sdk.dev):

```ts
// server/generate.ts
import { streamText } from 'ai';
import { catalog } from './catalog';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: catalog.prompt({
      customRules: [
        'Use a Stack as the root element',
        // ng-json-render does not expand `repeat` yet (see Status & roadmap).
        'Do not use repeat; write out each element explicitly',
      ],
    }),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

The model's reply looks like this:

```jsonl
{"op":"add","path":"/root","value":"main"}
{"op":"add","path":"/elements/main","value":{"type":"Stack","props":{"gap":16},"children":["signups"]}}
{"op":"add","path":"/elements/signups","value":{"type":"Stat","props":{"label":"Signups","value":"1,204"},"children":[]}}
```

### 3. Stream the patches into a spec and render it (Angular)

`createSpecStreamCompiler` turns JSONL patches into a spec as they arrive. Put each result in a signal, and `<jr-renderer>` redraws as the UI grows:

```ts
import { Component, signal } from '@angular/core';
import { JrRenderer, createSpecStreamCompiler, type JrActionEvent, type Spec } from '@ng-json-render/core';

@Component({
  selector: 'app-assistant',
  imports: [JrRenderer],
  template: `
    <form (submit)="$event.preventDefault(); generate(prompt.value)">
      <input #prompt placeholder="Describe the UI you want…" />
      <button [disabled]="streaming()">Generate</button>
    </form>
    <jr-renderer [spec]="spec()" (action)="onAction($event)" />
  `,
})
export class Assistant {
  readonly spec = signal<Spec | null>(null);
  readonly streaming = signal(false);

  async generate(prompt: string) {
    this.streaming.set(true);
    const compiler = createSpecStreamCompiler<Spec>();
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();

    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const { result, newPatches } = compiler.push(value);
      if (newPatches.length) this.spec.set({ ...result });
    }
    this.streaming.set(false);
  }

  onAction(e: JrActionEvent) { /* e.action === 'export_data' → run your own code */ }
}
```

Not streaming? Collect the whole reply and call `compileSpecStream(text)` to get the spec in one go.

For editing an existing spec ("make the chart a line chart"), inline chat + UI, and other prompt options, see json-render's [generation modes](https://json-render.dev/docs) and [`buildUserPrompt`](https://www.npmjs.com/package/@json-render/core#user-prompt-builder). The spec format is identical, so all of it applies to Angular.

## Agent skills

If you use an AI coding agent (Claude Code, Cursor, Codex and others), install the ng-json-render [skills](skills) so the agent knows the Angular API, the built-in components and their exact props, and how to wire up a catalog and streaming:

```sh
npx skills add mainawycliffe/ng-json-render --skill ng-json-render             # @ng-json-render/core
npx skills add mainawycliffe/ng-json-render --skill ng-json-render-primitives  # @ng-json-render/primitives

# catalogs, prompts and the spec format, from upstream json-render
npx skills add vercel-labs/json-render --skill core
```

The skills live in [`skills/`](skills) and follow the same format as [json-render's skills](https://json-render.dev/docs/skills).

## Features

- **Native rendering.** Each element becomes a real Angular component, created with `ViewContainerRef.createComponent()`. Children are projected into the component's `<ng-content>`.
- **Granular reactivity.** A new spec rebuilds the tree. A state change only updates the inputs of the elements that read it, so there is no rebuild and inputs keep focus.
- **Data binding.** `@json-render/core` prop expressions: `$state`, `$cond/$then/$else`, `$template`, and **`$bindState` two-way binding** to `model()` form controls (structurally **Signal Forms**-compatible on Angular 21).
- **Actions.** Components raise events through the injected `JR_CONTEXT`. Events go to handlers registered with `provideJsonRender({ actions })` and to the renderer's `(action)` output.
- **Batteries included.** Layout (Container, Stack, Grid, Card, Divider), content (Heading, Text, Badge, Stat), feedback (Alert, Progress), data-viz (**BarChart, LineChart, Table**, no chart dependencies) and forms (Input, Textarea, Select, Checkbox, Switch, Button).
- **Modern Angular.** Signals, standalone components and zoneless change detection.

## Custom components

The real value of generative UI comes when the model builds screens from **your** components. Any standalone Angular component can be registered; there's no base class to extend and no decorator to add. The renderer wires four things into it:

| Concern | How | Notes |
| --- | --- | --- |
| **Props** | discrete `input()` / `model()` | resolved from the element's `props`, re-applied when bound state changes |
| **Children** | `<ng-content />` | the element's `children` are projected in order |
| **Events** | `inject(JR_CONTEXT).emit(name, payload)` | routed to the element's `on` bindings and action handlers |
| **Two-way state** | `model()` + `$bindState` | any control exposing a `value`/`checked` `model()` binds automatically (Signal Forms-compatible on Angular 21) |

Remember to add each new component to your **catalog** too, so the model knows it exists.

### 1. A display component (props + children)

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'my-callout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="callout" [class]="tone()">
      <strong>{{ title() }}</strong>
      <ng-content />
    </div>
  `,
})
export class MyCallout {
  title = input('');
  tone = input<'info' | 'warn'>('info');
}
```

### 2. An interactive component (events)

Components raise **named events** through `JR_CONTEXT`. The spec connects each event to an action through the element's `on` map. Handlers are registered with `provideJsonRender({ actions })`, and every action also appears on the renderer's `(action)` output. If an element has no `on` binding for an event, the event name is used as the action name.

```ts
import { Component, inject, input } from '@angular/core';
import { JR_CONTEXT } from '@ng-json-render/core';

@Component({
  selector: 'my-button',
  template: `<button (click)="ctx.emit('press', { at: Date.now() })">{{ label() }}</button>`,
})
export class MyButton {
  label = input('');
  protected ctx = inject(JR_CONTEXT);
}
```

```jsonc
// in a spec: "press" → the "save" action
{ "type": "Button", "props": { "label": "Save" }, "on": { "press": { "action": "save" } } }
```

### 3. A form control (two-way `$bindState`)

Expose the editable value as a `value` `model()` (or `checked` for checkboxes). That's all the renderer needs to two-way bind a `$bindState` prop. Because the shape matches Angular's Signal Forms `FormValueControl<T>` / `FormCheckboxControl`, the same control also works with the native `[field]` directive on Angular 21.

```ts
import { Component, model } from '@angular/core';

@Component({
  selector: 'my-input',
  template: `<input [value]="value()" (input)="value.set($any($event.target).value)" />`,
})
export class MyInput {
  readonly value = model(''); // structurally a Signal Forms FormValueControl<string>
}
```

> Want the compile-time contract on Angular 21? Add `implements FormValueControl<string>` with `import type { FormValueControl } from '@angular/forms/signals'`. That pins the component to Angular 21, so the bundled primitives keep it implicit to stay 19+.

```jsonc
{ "type": "Input", "props": { "value": { "$bindState": "/user/email" } } }
```

### 4. Register and provide

```ts
import { defineRegistry, mergeRegistries, provideJsonRender } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

const myRegistry = defineRegistry({ Callout: MyCallout, Button: MyButton, Input: MyInput });

// Compose with the built-ins (later entries win on conflicts):
const registry = mergeRegistries(primitivesRegistry, myRegistry);

// Provide app-wide (registry + action handlers), or pass [registry] per <jr-renderer>:
provideJsonRender({
  registry,
  actions: {
    save: (ctx) => console.log('save', ctx.payload),
  },
});
```

## Other ways to get a spec

### Hand-written

The [Getting started](#getting-started) example: hold a spec in a `signal` and pass it to `<jr-renderer>`. This is useful for prototyping, tests and fixed screens.

### Server-driven (fetch a spec)

Your backend builds a spec (from a CMS, a form builder, per-tenant config, or a model that isn't streaming) and returns it as JSON:

```ts
import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { JrRenderer, type JrActionEvent, type Spec } from '@ng-json-render/core';

@Component({
  selector: 'app-remote-ui',
  imports: [JrRenderer],
  template: `
    @if (ui.value(); as spec) {
      <jr-renderer [spec]="spec" (action)="onAction($event)" />
    }
  `,
})
export class RemoteUi {
  ui = httpResource<Spec>(() => '/api/ui/settings');
  onAction(e: JrActionEvent) { /* POST back to your action endpoint */ }
}
```

## Examples

- **[Docs & live demo](https://mainawycliffe.github.io/ng-json-render/)**: interactive docs for every primitive.
- **[`apps/demo`](apps/demo)**: the analytics dashboard in this repo, rendered entirely from one spec.
- **[skein-arcade web app](https://github.com/skein-js/skein-arcade/tree/main/apps/web)**: a real-world Angular app built with ng-json-render.

## Built-in components (`@ng-json-render/primitives`)

These are the `type`s that `primitivesRegistry` can render. To let a model use them, add them to your catalog.

| Group | `type` | Key props |
| --- | --- | --- |
| Layout | `Container` `Stack` `Grid` `Card` `Divider` | `maxWidth` · `direction/gap/align` · `columns` · `title/subtitle` |
| Content | `Heading` `Text` `Badge` `Stat` | `value/level` · `value/weight/size` · `label/tone` · `label/value/delta` |
| Feedback | `Alert` `Progress` | `title/message/tone` · `value/label` |
| Data-viz | `BarChart` `LineChart` `Table` | `data[{label,value}]` · `data:number[]` · `columns/rows` |
| Forms | `Input` `Textarea` `Select` `Checkbox` `Switch` `Button` | `value`/`checked` via `$bindState`; `Button` emits `press` |

## Testing

Use the `renderSpec()` harness. It mounts a real `<jr-renderer>` and returns DOM query helpers, so every test exercises the actual rendering path.

```ts
import { renderSpec } from '@ng-json-render/core/testing';
import { primitivesRegistry } from '@ng-json-render/primitives';

const r = renderSpec(
  { root: 'b', elements: { b: { type: 'Button', props: { label: 'Save' }, on: { press: { action: 'save' } } } } },
  { registry: primitivesRegistry },
);

expect(r.query('button')?.textContent).toContain('Save');
r.query('button')?.click();
expect(r.actions.map((a) => a.action)).toEqual(['save']);
```

Coverage lives in [`libs/primitives/src/lib/render.spec.ts`](libs/primitives/src/lib/render.spec.ts) (every primitive rendered through the renderer) and [`libs/core/src/lib/jr-renderer.spec.ts`](libs/core/src/lib/jr-renderer.spec.ts) (renderer behavior: nesting, binding, actions).

## Development

Everything runs through Nx.

```sh
git clone https://github.com/mainawycliffe/ng-json-render.git
cd ng-json-render
pnpm install

pnpm exec nx serve demo                 # run the docs site / dashboard demo
pnpm exec nx run-many -t lint test build # lint, test, build all projects
pnpm exec nx build core                 # build a publishable package
pnpm exec nx release publish --dry-run  # verify publishing
```

**Stack:** Nx 23 · Angular 19–22 supported (workspace on 21; standalone, zoneless, signals) · pnpm · Vitest · Tailwind v4 · `@json-render/core`.

> Adding a new library mid-session? The Angular Language Server caches `tsconfig` path aliases. Run **"TypeScript: Restart TS Server"** in your editor if a new `@ng-json-render/*` import shows as unresolved. (Builds are unaffected.)

## Publishing

Both libraries are publishable Angular packages (ng-packagr, partial compilation) with `publishConfig.access: public`, released via [Nx Release](https://nx.dev/features/manage-releases):

```sh
# Bump versions → changelog → publish (interactive)
pnpm exec nx release

# Or step by step
pnpm exec nx release version 0.1.0
pnpm exec nx release publish --dry-run   # verify first
pnpm exec nx release publish

# Test end-to-end against a local registry (no npm)
pnpm exec nx local-registry              # starts Verdaccio on :4873
```

`@ng-json-render/primitives` depends on `@ng-json-render/core`, so publish core first (or as one release group) and keep versions aligned. Consumers install the `@json-render/core` peer alongside.

## Docs site

The demo doubles as the docs site and deploys to GitHub Pages via [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml) on every push to `main`. It builds the SPA with `--base-href=/ng-json-render/`, adds a `404.html` fallback for client-side routes, and publishes with `actions/deploy-pages`.

**One-time setup:** repo **Settings → Pages → Source: “GitHub Actions.”** The site then lives at [mainawycliffe.github.io/ng-json-render](https://mainawycliffe.github.io/ng-json-render/).

## Status & roadmap

**Implemented:** the renderer, granular reactivity, data binding (`$state`, `$cond`, `$template`, `$bindState`), visibility conditions (`visible`, checked when the tree is built), actions, two-way Signal Forms binding, a 20-component Tailwind component set with charts, and a full dashboard demo. Streaming works today with `createSpecStreamCompiler` (see [Generate UI with an AI model](#generate-ui-with-an-ai-model)).

**Planned:** a first-class `injectUiStream()` helper, re-checking `visible` when state changes, `repeat` with `$item/$index`, catalog-driven validators, a ready-made catalog for the primitives, a broader/shadcn component set, and AI SDK integration.

## License

[MIT](LICENSE) © Maina Wycliffe
