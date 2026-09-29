import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { CONTROL, FIELD_LABEL } from './form-styles';

/**
 * Text input. A Signal Forms value control — usable with the `[field]`
 * directive, or driven by `$bindState` through the renderer.
 */
@Component({
  selector: 'jr-input',
  template: `
    <label class="flex flex-col gap-1.5">
      @if (label()) {
        <span [class]="labelClass">{{ label() }}</span>
      }
      <input
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [class]="controlClass"
        (input)="value.set(read($event))"
      />
      @if (hint()) {
        <span class="text-xs text-zinc-500 dark:text-zinc-400">{{
          hint()
        }}</span>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrInput {
  readonly value = model('');
  readonly label = input<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password' | 'number'>('text');
  readonly hint = input<string>();
  protected readonly labelClass = FIELD_LABEL;
  protected readonly controlClass = CONTROL;
  protected read(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
