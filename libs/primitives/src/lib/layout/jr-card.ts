import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Bordered surface with an optional title/subtitle. */
@Component({
  selector: 'jr-card',
  template: `
    @if (title() || subtitle()) {
      <div class="mb-3">
        @if (title()) {
          <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {{ title() }}
          </div>
        }
        @if (subtitle()) {
          <div class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ subtitle() }}
          </div>
        }
      </div>
    }
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900',
  },
})
export class JrCard {
  readonly title = input<string>();
  readonly subtitle = input<string>();
}
