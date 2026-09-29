import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Centered, max-width page container. */
@Component({
  selector: 'jr-container',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full',
    style: 'margin-inline: auto;',
    '[style.max-width]': 'maxWidthValue()',
  },
})
export class JrContainer {
  readonly maxWidth = input<number | string>(960);
  protected readonly maxWidthValue = computed(() => {
    const w = this.maxWidth();
    return typeof w === 'number' ? `${w}px` : w;
  });
}
