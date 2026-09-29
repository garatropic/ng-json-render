import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { JR_CONTEXT } from '@ng-json-render/core';

const BUTTON_VARIANTS: Record<string, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500/40',
  secondary:
    'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  ghost:
    'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500/40',
};

/**
 * Button that emits the `press` action. Outside a `<jr-renderer>` (no
 * `JR_CONTEXT`) it renders as a plain button.
 */
@Component({
  selector: 'jr-button',
  template: `
    <button
      type="button"
      [class]="buttonClass()"
      [disabled]="disabled()"
      (click)="ctx?.emit('press')"
    >
      {{ label() }}<ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
})
export class JrButton {
  readonly label = input('');
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>(
    'primary',
  );
  readonly disabled = input(false);
  protected readonly ctx = inject(JR_CONTEXT, { optional: true });
  protected readonly buttonClass = computed(
    () =>
      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none ' +
      (BUTTON_VARIANTS[this.variant()] ?? BUTTON_VARIANTS['primary']),
  );
}
