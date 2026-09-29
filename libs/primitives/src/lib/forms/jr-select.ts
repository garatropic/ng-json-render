import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { CONTROL, FIELD_LABEL } from './form-styles';

/** An option for {@link JrSelect}. */
export type JrSelectOption = string | { value: string; label?: string };

/** Dropdown select (Signal Forms value control). */
@Component({
  selector: 'jr-select',
  template: `
    <label class="flex flex-col gap-1.5">
      @if (label()) {
        <span [class]="labelClass">{{ label() }}</span>
      }
      <!-- Select per option: <select [value]> runs before the options exist. -->
      <select [class]="controlClass" (change)="value.set(read($event))">
        @if (placeholder()) {
          <option value="" disabled [selected]="value() === ''">
            {{ placeholder() }}
          </option>
        }
        @for (opt of normalized(); track opt.value) {
          <option [value]="opt.value" [selected]="opt.value === value()">
            {{ opt.label }}
          </option>
        }
      </select>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrSelect {
  readonly value = model('');
  readonly label = input<string>();
  readonly placeholder = input<string>();
  readonly options = input<JrSelectOption[]>([]);
  protected readonly labelClass = FIELD_LABEL;
  protected readonly controlClass = CONTROL;
  protected readonly normalized = computed(() =>
    this.options().map((o) =>
      typeof o === 'string'
        ? { value: o, label: o }
        : { value: o.value, label: o.label ?? o.value },
    ),
  );
  protected read(e: Event): string {
    return (e.target as HTMLSelectElement).value;
  }
}
