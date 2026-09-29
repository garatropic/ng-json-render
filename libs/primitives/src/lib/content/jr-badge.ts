import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const BADGE_TONES: Record<string, string> = {
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  success:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  info: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
};

/** Small status pill. */
@Component({
  selector: 'jr-badge',
  template: `{{ label() }}<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'toneClass()',
  },
})
export class JrBadge {
  readonly label = input('');
  readonly tone = input<'neutral' | 'success' | 'warning' | 'danger' | 'info'>(
    'neutral',
  );
  protected readonly toneClass = computed(
    () =>
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
      (BADGE_TONES[this.tone()] ?? BADGE_TONES['neutral']),
  );
}
