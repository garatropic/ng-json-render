import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Step {
  title: string;
  body: string;
  code: string;
}

@Component({
  selector: 'app-ai',
  template: `
    <div class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Generate UI with AI</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Your server turns a catalog into a system prompt and calls the model.
        The model responds with JSONL, one JSON Patch per line. The browser
        applies the patches to a spec as they arrive, and
        <code>&lt;jr-renderer&gt;</code> renders it progressively.
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

    <h2 class="mt-12 mb-3 text-lg font-semibold">Guidelines</h2>
    <ul class="max-w-2xl list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
      @for (g of guidelines; track g.title) {
        <li><strong>{{ g.title }}</strong> {{ g.body }}</li>
      }
    </ul>

    <p class="mt-8 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
      To edit an existing spec with a follow-up prompt, see
      <code>buildUserPrompt</code> in the
      <a
        href="https://json-render.dev/docs"
        target="_blank"
        rel="noreferrer"
        class="text-indigo-600 hover:underline dark:text-indigo-400"
        >json-render docs</a
      >.
    </p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiPage {
  protected readonly guidelines = [
    {
      title: 'Keep the catalog small.',
      body: 'Every component and prop is something the model can get wrong. Write descriptions as documentation; they are all the model sees.',
    },
    {
      title: 'Keep the catalog and registry in sync.',
      body: 'A type missing from the registry is skipped; a type missing from the catalog is never generated.',
    },
    {
      title: 'Treat actions as intents.',
      body: 'The model names an action; your handler decides what happens and checks permissions. Don’t execute URLs, queries or code from a spec.',
    },
    {
      title: 'Validate on the server.',
      body: 'Check the spec with catalog.validate(spec) or validateSpec(spec) before sending it to the client, and handle failures.',
    },
  ];

  protected readonly steps: Step[] = [
    {
      title: 'Define a catalog (server)',
      body: 'The catalog lists the components the model may use, each with Zod props and a description; the description is what the model reads. @json-render/core has no ready-made schema for this renderer, so define the flat spec schema. Every catalog type must also be in the registry. Use .optional() for optional props, not .nullable(): an explicit null is set on the input and replaces its default.',
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
      title: 'Prompt the model (server)',
      body: 'catalog.prompt() returns a system prompt describing the spec format, your components and your actions, and asks for JSONL output. The default prompt also describes repeat, which this renderer does not support yet, so add a rule against it. Any LLM SDK works; this example uses the AI SDK.',
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
      title: 'Render the stream (Angular)',
      body: 'createSpecStreamCompiler applies patches as they arrive and buffers lines split across chunks. Set each result on a signal and the renderer updates as the UI grows. If you receive the whole response at once, use compileSpecStream(text).',
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
      body: 'When a user clicks a generated button, the spec names the action and your handler runs it. Handlers receive { action, payload, nodeId, element }. Register them with provideJsonRender, or listen on (action).',
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
