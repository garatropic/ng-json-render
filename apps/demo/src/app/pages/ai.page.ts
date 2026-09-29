import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  title: string;
  body: string;
  code: string;
}

interface Tip {
  title: string;
  body: string;
}

@Component({
  selector: 'app-ai',
  imports: [RouterLink],
  template: `
    <div class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Generate UI with AI</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Here is the whole loop. Your server turns a <strong>catalog</strong>
        into a system prompt and calls a model. The model answers with a
        <strong>spec</strong>, written as JSON patches, one per line. The
        browser compiles those patches into a spec and
        <code>&lt;jr-renderer&gt;</code> renders it, updating as each line
        arrives.
      </p>
      <pre
        class="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100 dark:border-zinc-800"
      ><code>{{ flow }}</code></pre>
    </div>

    <h2 class="mb-3 text-lg font-semibold">How to approach it</h2>
    <div class="mb-10 grid max-w-4xl gap-4 sm:grid-cols-2">
      @for (tip of tips; track tip.title) {
        <div
          class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ tip.title }}
          </div>
          <p class="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {{ tip.body }}
          </p>
        </div>
      }
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

    <div
      class="mt-10 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h3 class="text-sm font-semibold">Next steps</h3>
      <ul class="mt-2 space-y-1 text-sm text-indigo-600 dark:text-indigo-400">
        <li>
          <a routerLink="/custom" class="hover:underline"
            >Let the model use your own components →</a
          >
        </li>
        <li>
          <a routerLink="/dashboard" class="hover:underline"
            >See a full dashboard rendered from one spec →</a
          >
        </li>
        <li>
          <a
            href="https://json-render.dev/docs"
            target="_blank"
            rel="noreferrer"
            class="hover:underline"
            >Generation modes, editing specs & more (json-render docs) →</a
          >
        </li>
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiPage {
  protected readonly flow = `user prompt
   │
   ▼
your server:  catalog.prompt()  +  LLM call
   │
   ▼  JSONL patches, one per line
browser:      createSpecStreamCompiler()  →  spec signal
   │
   ▼
<jr-renderer [spec]>  →  your Angular components`;

  protected readonly tips: Tip[] = [
    {
      title: 'Start from the UI, not the model',
      body: 'Hand-write two or three specs for real screens first. If you can’t express a screen with your components, the model can’t either.',
    },
    {
      title: 'Keep the catalog small and well described',
      body: 'Every component and prop is something the model can get wrong. Each component’s description is the model’s only documentation, so write it like documentation.',
    },
    {
      title: 'Make the catalog match the registry',
      body: 'The catalog tells the model what exists; the registry tells Angular how to draw it. A type in one but not the other renders nothing or is never generated.',
    },
    {
      title: 'Keep actions as intents',
      body: 'The model names what the user wants (export_data, choose_plan). Your action handlers decide how, and check permissions. Never run URLs, queries or code taken from a spec.',
    },
    {
      title: 'Validate before you trust',
      body: 'Check the result with catalog.validate(spec) or validateSpec, and show a fallback when it fails. Unknown types are skipped by the renderer, never executed.',
    },
    {
      title: 'Stream it',
      body: 'Each line the model writes is a complete patch, so you can render after every line. Users see the UI appear instead of waiting on a spinner.',
    },
  ];

  protected readonly steps: Step[] = [
    {
      title: 'Define a catalog (server)',
      body: 'List the components your registry can render, with Zod props and a description for each, plus the actions the model may wire up. The schema describes the flat spec format that ng-json-render renders. @ng-json-render/primitives ships components and a registry but not a catalog, so list the primitives you want the model to use here.',
      code: `// server/catalog.ts
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
      props: z.object({ gap: z.number().optional() }),
      description: 'Lays out its children in a column',
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
});`,
    },
    {
      title: 'Build the prompt and call the model (server)',
      body: 'catalog.prompt() writes a system prompt that describes the spec format, your components and your actions, and asks the model to answer in JSONL (one JSON Patch per line). Use any LLM SDK; this example uses the AI SDK. ng-json-render does not expand repeat yet, so tell the model not to use it.',
      code: `// server/generate.ts
import { streamText } from 'ai';
import { catalog } from './catalog';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-haiku-4.5',
    system: catalog.prompt({
      customRules: [
        'Use a Stack as the root element',
        'Do not use repeat; write out each element explicitly',
      ],
    }),
    prompt,
  });

  return result.toTextStreamResponse();
}

// The model replies with lines like:
// {"op":"add","path":"/root","value":"main"}
// {"op":"add","path":"/elements/main","value":{"type":"Stack","props":{"gap":16},"children":["signups"]}}
// {"op":"add","path":"/elements/signups","value":{"type":"Stat","props":{"label":"Signups","value":"1,204"},"children":[]}}`,
    },
    {
      title: 'Stream the patches into a spec and render it (Angular)',
      body: 'createSpecStreamCompiler turns JSONL patches into a spec as they arrive. Put each result in a signal and <jr-renderer> updates as the UI grows. Not streaming? Collect the whole reply and call compileSpecStream(text) instead.',
      code: `import { Component, signal } from '@angular/core';
import { JrRenderer, createSpecStreamCompiler, type JrActionEvent, type Spec } from '@ng-json-render/core';

@Component({
  selector: 'app-assistant',
  imports: [JrRenderer],
  template: \`
    <form (submit)="$event.preventDefault(); generate(prompt.value)">
      <input #prompt placeholder="Describe the UI you want…" />
      <button [disabled]="streaming()">Generate</button>
    </form>
    <jr-renderer [spec]="spec()" (action)="onAction($event)" />
  \`,
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
}`,
    },
    {
      title: 'Handle actions',
      body: 'When the user clicks a generated button, the spec names an action and your code runs it. Register handlers app-wide, or listen on (action).',
      code: `provideJsonRender({
  registry: primitivesRegistry,
  actions: {
    export_data: async (ctx) => {
      // ctx.action, ctx.payload, ctx.nodeId, ctx.element
      await exportService.exportCurrentView();
    },
  },
});`,
    },
  ];
}
