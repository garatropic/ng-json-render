import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** A single {label, value} datum for charts. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** Responsive CSS bar chart (no chart library). */
@Component({
  selector: 'jr-bar-chart',
  template: `
    <div class="flex items-end gap-2" [style.height.px]="height()">
      @for (bar of bars(); track $index) {
        <div class="flex h-full flex-1 items-end">
          <div
            role="img"
            class="w-full rounded-t-md bg-indigo-500 transition-[height] duration-300 dark:bg-indigo-400"
            [style.height.%]="bar.pct"
            [attr.aria-label]="bar.text"
            [title]="bar.text"
          ></div>
        </div>
      }
    </div>
    <div class="mt-1.5 flex gap-2" aria-hidden="true">
      @for (bar of bars(); track $index) {
        <div
          class="flex-1 truncate text-center text-xs text-zinc-500 dark:text-zinc-400"
        >
          {{ bar.label }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrBarChart {
  readonly data = input<ChartDatum[]>([]);
  readonly height = input(160);

  protected readonly bars = computed(() => {
    const data = this.data();
    const max = Math.max(1, ...data.map((d) => d.value));
    return data.map((d) => ({
      label: d.label,
      text: `${d.label}: ${d.value}`,
      pct: Math.max(2, (d.value / max) * 100),
    }));
  });
}
