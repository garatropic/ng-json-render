import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocsExample } from '../shared/app-docs-example';
import { HELLO_SPEC } from '../examples';

@Component({
  selector: 'app-overview',
  imports: [DocsExample, RouterLink],
  template: `
    <section class="max-w-2xl">
      <h1 class="text-3xl font-semibold tracking-tight">ng-json-render</h1>
      <p class="mt-3 text-lg text-zinc-600 dark:text-zinc-300">
        Generative UI for Angular. Let an AI model (or your server) describe a
        UI as JSON, and render it as your own native Angular components. No
        iframes, no <code>eval</code>, no generated code.
      </p>
      <p class="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        The Angular renderer for
        <a
          href="https://json-render.dev"
          target="_blank"
          rel="noreferrer"
          class="text-indigo-600 hover:underline dark:text-indigo-400"
          >json-render</a
        >
        by Vercel Labs. It uses the same catalogs, specs and prompts as the
        other json-render renderers. Only the rendering layer is Angular.
      </p>
    </section>

    <section class="mt-10 max-w-2xl space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
      <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Why this exists
      </h2>
      <p>
        Imagine you are building an analytics assistant. A user types:
        <em>“Show me last week's signups next to churn, and let me change the
        date range.”</em> A chatbot answers with a paragraph of text, but the
        user wanted <strong>a UI</strong>: two stat cards, a chart and a date
        picker they can click. Each question needs a different screen, and you
        can't design every screen ahead of time.
      </p>
      <p>So you ask the model to build the screen. The obvious approaches don't hold up:</p>
      <ul class="list-disc space-y-1 pl-5">
        <li>
          <strong>Let the model write HTML or Angular code.</strong> You would
          run untrusted, unreviewed code in your app. It can break your layout,
          ignore your design system or run scripts, and you can't validate it.
        </li>
        <li>
          <strong>Render the model's HTML in an iframe.</strong> It is isolated,
          but it doesn't look or behave like your app, and it can't use your
          components, state or services.
        </li>
        <li>
          <strong>Hard-code a few screens and let the model pick one.</strong>
          Safe, but not generative. You are back to designing every screen.
        </li>
      </ul>
      <p>
        json-render takes a middle path, and that path is
        <strong>Generative UI</strong>: the AI generates the interface itself
        (which components to show, how to arrange them, what data to bind, what
        actions to wire up), but only from building blocks you approved. The
        model decides <em>what</em> to show. You decide <em>what it is allowed
        to show</em> and <em>how each piece looks and behaves</em>. Nothing the
        model writes is ever executed. It is just JSON that your components
        render.
      </p>
      <p>
        The same idea works without AI. A
        <strong>server-driven UI</strong> is a spec that your backend builds,
        for example a form definition, a CMS page or a per-tenant dashboard.
        ng-json-render renders both kinds the same way.
      </p>
    </section>

    <h2 class="mt-10 mb-3 text-lg font-semibold">How it works</h2>
    <ol class="grid gap-4 sm:grid-cols-3">
      @for (c of concepts; track c.term; let i = $index) {
        <li
          class="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {{ i + 1 }} · {{ c.who }}
          </div>
          <div class="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ c.term }}
          </div>
          <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ c.desc }}</p>
        </li>
      }
    </ol>
    <p class="mt-3 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
      The spec is passed to the <strong>renderer</strong>
      (<code>&lt;jr-renderer&gt;</code>). Props can use <strong>data binding</strong>
      to read and write the spec's state, components raise
      <strong>actions</strong> that your code handles, and the spec can
      <strong>stream</strong> in so the UI appears as the model writes it.
    </p>

    <h2 class="mt-10 mb-3 text-lg font-semibold">Try it</h2>
    <p class="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
      On the right is a spec, the kind of JSON a model would write. On the left
      is what the renderer builds from it. Edit the name: the
      <code>$bindState</code> input writes to state, and the
      <code>$template</code> greeting reads from it.
    </p>
    <app-docs-example [spec]="helloSpec" />

    <div class="mt-10 flex flex-wrap gap-3">
      <a
        routerLink="/start"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >Get started</a
      >
      <a
        routerLink="/ai"
        class="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >Generate UI with AI</a
      >
      <a
        routerLink="/components"
        class="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >Browse components</a
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewPage {
  protected readonly helloSpec = HELLO_SPEC;
  protected readonly concepts = [
    {
      who: 'You define',
      term: 'Catalog',
      desc: 'The components, actions and validation functions the AI can use, with typed props. The contract between your app and the AI.',
    },
    {
      who: 'The AI generates',
      term: 'Spec',
      desc: 'The JSON output: a flat tree of typed elements with props, children, data bindings and visibility conditions.',
    },
    {
      who: 'Your app renders',
      term: 'Registry',
      desc: 'Maps each catalog type to a real Angular component, so the generated UI is built from your own components.',
    },
  ];
}
