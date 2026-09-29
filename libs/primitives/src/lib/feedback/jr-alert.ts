import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const ALERT_TONES: Record<string, string> = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  danger:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

/**
 * Inline callout. `warning` and `danger` are announced immediately
 * (`role="alert"`); `info` and `success` are polite (`role="status"`).
 */
@Component({
  selector: 'jr-alert',
  template: `
    @if (title()) {
      <div class="font-medium">{{ title() }}</div>
    }
    <div class="text-sm" [class.mt-0.5]="!!title()">
      {{ message() }}<ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'urgent() ? "alert" : "status"',
    '[class]': 'toneClass()',
  },
})
export class JrAlert {
  readonly title = input<string>();
  readonly message = input('');
  readonly tone = input<'info' | 'success' | 'warning' | 'danger'>('info');
  protected readonly urgent = computed(
    () => this.tone() === 'warning' || this.tone() === 'danger',
  );
  protected readonly toneClass = computed(
    () =>
      'block rounded-lg border px-4 py-3 ' +
      (ALERT_TONES[this.tone()] ?? ALERT_TONES['info']),
  );
}
