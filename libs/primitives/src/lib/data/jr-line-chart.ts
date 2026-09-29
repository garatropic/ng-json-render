import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Responsive SVG line/area chart (no chart library). Set `label` to describe
 * the series to assistive tech; without it the chart is decorative.
 */
@Component({
  selector: 'jr-line-chart',
  template: `
    <svg
      viewBox="0 0 300 100"
      preserveAspectRatio="none"
      class="w-full"
      [style.height.px]="height()"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @if (geom().line) {
        <polygon
          [attr.points]="geom().area"
          class="fill-indigo-500/10 dark:fill-indigo-400/10"
        />
        <polyline
          [attr.points]="geom().line"
          fill="none"
          class="stroke-indigo-500 dark:stroke-indigo-400"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
        />
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrLineChart {
  readonly data = input<number[]>([]);
  readonly height = input(120);
  /** Accessible description of the series, e.g. "Signups, last 7 days". */
  readonly label = input<string>();

  protected readonly geom = computed(() => {
    const d = this.data();
    if (d.length < 2) return { line: '', area: '' };
    const w = 300;
    const h = 100;
    const max = Math.max(...d);
    const min = Math.min(...d);
    const range = max - min || 1;
    const step = w / (d.length - 1);
    const pts = d.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h * 0.9) - h * 0.05;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return { line: pts.join(' '), area: `0,${h} ${pts.join(' ')} ${w},${h}` };
  });
}
