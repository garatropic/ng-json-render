import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

/** Toggle switch (Signal Forms checkbox control). */
@Component({
  selector: 'jr-switch',
  template: `
    <div class="flex cursor-pointer items-center justify-between gap-3">
      <span class="text-sm text-zinc-700 dark:text-zinc-300">{{
        label()
      }}</span>
      <button
        type="button"
        role="switch"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label() || null"
        (click)="checked.set(!checked())"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        [class.bg-indigo-600]="checked()"
        [class.bg-zinc-300]="!checked()"
        [class.dark:bg-zinc-700]="!checked()"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          [class.translate-x-6]="checked()"
          [class.translate-x-1]="!checked()"
        ></span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrSwitch {
  readonly checked = model(false);
  readonly label = input('');
}
