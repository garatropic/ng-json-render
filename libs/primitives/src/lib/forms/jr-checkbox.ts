import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';

/** Checkbox (Signal Forms checkbox control). */
@Component({
  selector: 'jr-checkbox',
  template: `
    <label class="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/40 dark:border-zinc-600 dark:bg-zinc-800"
        [checked]="checked()"
        (change)="checked.set(read($event))"
      />
      <span class="text-sm text-zinc-700 dark:text-zinc-300">{{
        label()
      }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrCheckbox {
  readonly checked = model(false);
  readonly label = input('');
  protected read(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
}
