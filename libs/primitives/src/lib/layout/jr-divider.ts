import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Horizontal rule. */
@Component({
  selector: 'jr-divider',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block border-t border-zinc-200 dark:border-zinc-800',
    role: 'separator',
  },
})
export class JrDivider {}
