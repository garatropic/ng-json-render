import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  JR_CONTEXT,
  type JrRegistry,
  defineRegistry,
  mergeRegistries,
} from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

/**
 * A custom catalog component. Props are discrete `input()`s, the click raises a
 * named event through `JR_CONTEXT`, and it's registered under a `type` string.
 */
@Component({
  selector: 'app-pricing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex h-full flex-col rounded-2xl border p-6"
      [class.border-indigo-500]="featured()"
      [class.ring-2]="featured()"
      [class.ring-indigo-500/20]="featured()"
      [class.border-zinc-200]="!featured()"
      [class.dark:border-zinc-800]="!featured()"
    >
      <div class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
        {{ plan() }}
      </div>
      <div class="mt-2 flex items-baseline gap-1">
        <span class="text-3xl font-bold">{{ price() }}</span>
        <span class="text-sm text-zinc-500">/mo</span>
      </div>
      <ul class="mt-4 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
        @for (f of features(); track f) {
          <li class="flex items-center gap-2">
            <span class="text-indigo-500" aria-hidden="true">✓</span> {{ f }}
          </li>
        }
      </ul>
      <button
        class="mt-6 rounded-lg px-4 py-2 text-sm font-medium"
        [class.bg-indigo-600]="featured()"
        [class.text-white]="featured()"
        [class.border]="!featured()"
        [class.border-zinc-300]="!featured()"
        [class.dark:border-zinc-700]="!featured()"
        (click)="ctx.emit('select', { plan: plan() })"
      >
        Choose {{ plan() }}
      </button>
    </div>
  `,
})
export class PricingCard {
  readonly plan = input('');
  readonly price = input('');
  readonly features = input<string[]>([]);
  readonly featured = input(false);
  protected readonly ctx = inject(JR_CONTEXT);
}

/** A second custom component — a testimonial quote. */
@Component({
  selector: 'app-testimonial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure
      class="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <blockquote class="text-zinc-700 dark:text-zinc-200">
        “{{ quote() }}”
      </blockquote>
      <figcaption class="mt-4 flex items-center gap-3">
        <span
          class="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          >{{ initials() }}</span
        >
        <span class="text-sm">
          <span class="block font-medium">{{ author() }}</span>
          <span class="text-zinc-500 dark:text-zinc-400">{{ role() }}</span>
        </span>
      </figcaption>
    </figure>
  `,
})
export class Testimonial {
  readonly quote = input('');
  readonly author = input('');
  readonly role = input('');
  protected readonly initials = computed(() =>
    this.author()
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  );
}

/** Custom components merged on top of the built-in primitives. */
export const customRegistry: JrRegistry = mergeRegistries(
  primitivesRegistry,
  defineRegistry({
    PricingCard: PricingCard,
    Testimonial: Testimonial,
  }),
);
