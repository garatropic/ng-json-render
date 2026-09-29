import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsExample } from '../shared/app-docs-example';
import { HELLO_SPEC } from '../examples';

interface Step {
  title: string;
  body: string;
  code: string;
  lang: string;
}

@Component({
  selector: 'app-getting-started',
  imports: [DocsExample, RouterLink],
  template: `
    <div class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Get started</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Start without any AI: write a spec by hand, render it, and see how the
        catalog, spec and registry fit together. Once that works, letting a
        model write the spec is a small step. Works with Angular 19 through 22
        (standalone, signals, zoneless).
      </p>
    </div>

    <ol class="flex flex-col gap-8">
      @for (step of steps; track step.title; let i = $index) {
        <li class="flex gap-4">
          <span
            class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
            >{{ i + 1 }}</span
          >
          <div class="min-w-0 flex-1">
            <h2 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {{ step.title }}
            </h2>
            <p class="mt-1 mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              {{ step.body }}
            </p>
            <pre
              class="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 dark:border-zinc-800"
            ><code>{{ step.code }}</code></pre>
          </div>
        </li>
      }
    </ol>

    <h2 class="mt-12 mb-2 text-lg font-semibold">The result</h2>
    <p class="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
      The spec on the right renders live on the left. Two-way
      <code>$bindState</code> inputs and actions work out of the box.
    </p>
    <app-docs-example [spec]="helloSpec" />

    <div
      class="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 class="text-sm font-semibold">Next steps</h3>
      <ul class="mt-2 space-y-1 text-sm text-indigo-600 dark:text-indigo-400">
        <li>
          <a routerLink="/ai" class="hover:underline"
            >Let an AI model write the spec →</a
          >
        </li>
        <li>
          <a routerLink="/components" class="hover:underline"
            >Browse the built-in components →</a
          >
        </li>
        <li>
          <a routerLink="/custom" class="hover:underline"
            >Write your own components →</a
          >
        </li>
        <li>
          <a
            href="https://json-render.dev/docs"
            target="_blank"
            rel="noreferrer"
            class="hover:underline"
            >Catalogs, streaming & AI SDK (json-render docs) →</a
          >
        </li>
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GettingStartedPage {
  protected readonly helloSpec = HELLO_SPEC;

  protected readonly steps: Step[] = [
    {
      title: 'Install',
      body: 'Add the renderer, its @json-render/core peer (the framework-agnostic catalog, spec and streaming logic), and optionally the primitives: ready-made components plus a registry for them.',
      lang: 'sh',
      code: 'npm i @ng-json-render/core @json-render/core @ng-json-render/primitives',
    },
    {
      title: 'Set up Tailwind (primitives only)',
      body: 'The primitives are styled with Tailwind CSS v4. Set up Tailwind in your app (see the Tailwind + Angular guide), then have it scan the package from your global stylesheet.',
      lang: 'css',
      code: `/* src/styles.css */
@import 'tailwindcss';
@source '../node_modules/@ng-json-render/primitives';`,
    },
    {
      title: 'Provide a registry',
      body: 'A registry maps each type in a spec (Card, Button, …) to the Angular component that draws it. Provide a default registry, plus handlers for the actions your UI can raise, in your app config.',
      lang: 'ts',
      code: `import { ApplicationConfig } from '@angular/core';
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
};`,
    },
    {
      title: 'Render a spec',
      body: 'A spec is plain JSON: root names the first element, and elements is a flat map where each element has a type, props and the keys of its children. state holds data; { $bindState: "/name" } binds an input to state.name in both directions. Hold the spec in a signal and pass it to <jr-renderer>.',
      lang: 'ts',
      code: `import { Component, signal } from '@angular/core';
import { JrRenderer, type Spec } from '@ng-json-render/core';

@Component({
  selector: 'app-generated',
  imports: [JrRenderer],
  template: \`<jr-renderer [spec]="spec()" (action)="onAction($event)" />\`,
})
export class Generated {
  spec = signal<Spec>({
    root: 'root',
    state: { name: 'Ada' },
    elements: {
      root: { type: 'Stack', props: { gap: 12 }, children: ['h', 'in'] },
      h: { type: 'Heading', props: { value: 'Hello', level: 1 } },
      in: { type: 'Input', props: { label: 'Name', value: { $bindState: '/name' } } },
    },
  });
  onAction(e) { console.log(e.action, e.nodeId); }
}`,
    },
    {
      title: 'Load specs from anywhere',
      body: 'The spec is just JSON, so it can be hand-written, fetched from your backend (server-driven UI) or streamed from an AI model (generative UI). Set a new value on the signal and the UI updates.',
      lang: 'ts',
      code: `import { httpResource } from '@angular/common/http';
import { type Spec } from '@ng-json-render/core';

// Your server (or an agent) returns a spec:
readonly ui = httpResource<Spec>(() => '/api/generate-ui');

// template:
// @if (ui.value(); as spec) { <jr-renderer [spec]="spec" /> }`,
    },
  ];
}
