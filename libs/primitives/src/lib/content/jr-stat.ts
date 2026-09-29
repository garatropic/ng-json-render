import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** KPI tile: a big value with a label and an optional delta. */
@Component({
  selector: 'jr-stat',
  template: `
    <div class="text-sm font-medium text-zinc-500 dark:text-zinc-400">
      {{ label() }}
    </div>
    <div class="mt-1 flex items-baseline gap-2">
      <span class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {{ value() }}
      </span>
      @if (delta() !== null) {
        <span
          class="text-xs font-medium"
          [class.text-emerald-600]="!down()"
          [class.text-red-600]="down()"
        >
          <span aria-hidden="true">{{ down() ? '▼' : '▲' }}</span>
          <span class="sr-only">{{ down() ? 'down' : 'up' }}</span>
          {{ absDelta() }}%
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrStat {
  readonly label = input('');
  readonly value = input<string | number>('');
  readonly delta = input<number | null>(null);
  protected readonly down = computed(() => (this.delta() ?? 0) < 0);
  protected readonly absDelta = computed(() => Math.abs(this.delta() ?? 0));
}
