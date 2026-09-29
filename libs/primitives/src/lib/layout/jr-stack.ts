import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Flexbox stack (row or column) with configurable gap and alignment. */
@Component({
  selector: 'jr-stack',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: flex; box-sizing: border-box;',
    '[style.flex-direction]': 'direction()',
    '[style.gap]': 'gapValue()',
    '[style.align-items]': 'align()',
    '[style.justify-content]': 'justify()',
    '[style.flex-wrap]': 'wrap() ? "wrap" : null',
  },
})
export class JrStack {
  readonly direction = input<'row' | 'column'>('column');
  readonly gap = input<number | string>(12);
  readonly align = input<string>();
  readonly justify = input<string>();
  readonly wrap = input(false);

  protected readonly gapValue = computed(() => {
    const g = this.gap();
    return typeof g === 'number' ? `${g}px` : g;
  });
}
