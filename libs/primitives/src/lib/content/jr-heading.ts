import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const HEADING_SIZES: Record<number, string> = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-lg',
  4: 'text-base',
};

/** Section heading (levels 1–4), exposed to assistive tech as a heading. */
@Component({
  selector: 'jr-heading',
  template: `{{ value() }}<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'heading',
    '[attr.aria-level]': 'level()',
    '[class]': 'sizeClass()',
  },
})
export class JrHeading {
  readonly value = input('');
  readonly level = input<1 | 2 | 3 | 4>(2);

  protected readonly sizeClass = computed(
    () =>
      'block font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 ' +
      (HEADING_SIZES[this.level()] ?? HEADING_SIZES[2]),
  );
}
