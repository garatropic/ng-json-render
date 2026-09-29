import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Determinate progress bar (0–100). */
@Component({
  selector: 'jr-progress',
  template: `
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
    >
      <div
        class="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
        [style.width.%]="clamped()"
      ></div>
    </div>
    @if (label()) {
      <div class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {{ label() }} · {{ clamped() }}%
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'clamped()',
    '[attr.aria-label]': 'label() || null',
  },
})
export class JrProgress {
  readonly value = input<number>(0);
  readonly label = input<string>();
  protected readonly clamped = computed(() =>
    Math.max(0, Math.min(100, Math.round(this.value()))),
  );
}
