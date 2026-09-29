import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Body text. */
@Component({
  selector: 'jr-text',
  template: `{{ value() }}<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'text-zinc-600 dark:text-zinc-300',
    '[class.font-medium]': 'weight() === "medium"',
    '[class.font-semibold]': 'weight() === "bold"',
    '[class.text-sm]': 'size() === "sm"',
    '[class.text-xs]': 'size() === "xs"',
    '[class.text-lg]': 'size() === "lg"',
  },
})
export class JrText {
  readonly value = input('');
  readonly weight = input<'normal' | 'medium' | 'bold'>('normal');
  readonly size = input<'xs' | 'sm' | 'base' | 'lg'>('base');
}
