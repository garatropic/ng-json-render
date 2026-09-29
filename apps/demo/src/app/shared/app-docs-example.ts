import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  type JrActionEvent,
  type JrRegistry,
  JrRenderer,
  type Spec,
} from '@ng-json-render/core';

/**
 * Docs building block: renders a spec live (through the real `JrRenderer`)
 * next to the JSON that produced it, so every example is self-describing.
 */
@Component({
  selector: 'app-docs-example',
  imports: [JrRenderer],
  template: `
    @if (heading()) {
      <div class="mb-3">
        <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {{ heading() }}
        </h3>
        @if (description()) {
          <p class="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {{ description() }}
          </p>
        }
      </div>
    }

    <div class="grid gap-4" [class.xl:grid-cols-2]="showCode()">
      <div
        class="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <jr-renderer
          [spec]="spec()"
          [registry]="registry()"
          (action)="onAction($event)"
        />
      </div>

      @if (showCode()) {
        <pre
          class="max-h-[420px] overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 dark:border-zinc-800"
        ><code>{{ code() || json() }}</code></pre>
      }
    </div>

    @if (lastAction(); as a) {
      <p role="status" class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Action dispatched:
        <code class="font-medium text-indigo-600 dark:text-indigo-400">{{
          a
        }}</code>
      </p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class DocsExample {
  readonly spec = input.required<Spec>();
  /** Optional explicit registry; falls back to the DI default (primitives). */
  readonly registry = input<JrRegistry | null>(null);
  // Not `title`: that would also set the native tooltip attribute on the host.
  readonly heading = input<string>();
  readonly description = input<string>();
  /** Show the code panel (spec JSON, or a custom `code` string). */
  readonly showCode = input(true);
  /** Override the code panel content (e.g. component source) instead of the spec JSON. */
  readonly code = input<string>();

  protected readonly lastAction = signal<string | null>(null);
  protected readonly json = computed(() =>
    JSON.stringify(this.spec(), null, 2),
  );

  protected onAction(event: JrActionEvent): void {
    this.lastAction.set(`${event.action} (#${event.nodeId})`);
  }
}
