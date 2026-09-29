import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { CONTROL, FIELD_LABEL } from './form-styles';

/** Multi-line text input (Signal Forms value control). */
@Component({
  selector: 'jr-textarea',
  template: `
    <label class="flex flex-col gap-1.5">
      @if (label()) {
        <span [class]="labelClass">{{ label() }}</span>
      }
      <textarea
        [value]="value()"
        [placeholder]="placeholder()"
        [rows]="rows()"
        [class]="controlClass"
        (input)="value.set(read($event))"
      ></textarea>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrTextarea {
  readonly value = model('');
  readonly label = input<string>();
  readonly placeholder = input('');
  readonly rows = input(3);
  protected readonly labelClass = FIELD_LABEL;
  protected readonly controlClass = CONTROL;
  protected read(e: Event): string {
    return (e.target as HTMLTextAreaElement).value;
  }
}
