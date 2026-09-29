import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Responsive grid. `columns` is the target column count at full width; the grid
 * collapses to fewer columns as the container narrows (each column never shrinks
 * below `minItemWidth`), so specs stay responsive without media queries.
 */
@Component({
  selector: 'jr-grid',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: grid; box-sizing: border-box;',
    '[style.grid-template-columns]': 'templateColumns()',
    '[style.gap]': 'gapValue()',
  },
})
export class JrGrid {
  readonly columns = input<number>(2);
  readonly gap = input<number | string>(16);
  /** Minimum width a column may shrink to before the grid drops a column. */
  readonly minItemWidth = input<number>(200);

  protected readonly gapValue = computed(() => {
    const g = this.gap();
    return typeof g === 'number' ? `${g}px` : g;
  });

  protected readonly templateColumns = computed(() => {
    const cols = Math.max(1, this.columns());
    if (cols === 1) return '1fr';
    const gap = this.gapValue();
    const min = this.minItemWidth();
    // Width of one column when `cols` fit; `auto-fit` drops columns once this
    // would fall below `minItemWidth`. `min(100%, …)` avoids overflow on tiny screens.
    const ideal = `calc((100% - (${cols} - 1) * ${gap}) / ${cols})`;
    return `repeat(auto-fit, minmax(min(100%, max(${min}px, ${ideal})), 1fr))`;
  });
}
