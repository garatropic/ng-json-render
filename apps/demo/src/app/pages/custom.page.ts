import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Spec } from '@ng-json-render/core';
import { DocsExample } from '../shared/app-docs-example';
import { customRegistry } from '../custom/custom-components';

const PRICING_SPEC: Spec = {
  root: 'root',
  elements: {
    root: { type: 'Stack', props: { gap: 20 }, children: ['plans', 'quote'] },
    plans: {
      type: 'Grid',
      props: { columns: 3, gap: 16, minItemWidth: 240 },
      children: ['free', 'pro', 'ent'],
    },
    free: {
      type: 'PricingCard',
      props: {
        plan: 'Starter',
        price: '$0',
        features: ['1 project', 'Community support'],
      },
      on: { select: { action: 'choose_plan' } },
    },
    pro: {
      type: 'PricingCard',
      props: {
        plan: 'Pro',
        price: '$29',
        featured: true,
        features: ['Unlimited projects', 'Priority support', 'Analytics'],
      },
      on: { select: { action: 'choose_plan' } },
    },
    ent: {
      type: 'PricingCard',
      props: {
        plan: 'Enterprise',
        price: '$99',
        features: ['SSO & SAML', 'SLA', 'Dedicated CSM'],
      },
      on: { select: { action: 'choose_plan' } },
    },
    quote: {
      type: 'Testimonial',
      props: {
        quote:
          'We shipped agent-generated dashboards in a week. Same specs, native Angular.',
        author: 'Grace Hopper',
        role: 'VP Engineering, Navy',
      },
    },
  },
};

const COMPONENT_SOURCE = `import { Component, inject, input } from '@angular/core';
import { JR_CONTEXT, defineRegistry, mergeRegistries } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

@Component({
  selector: 'app-pricing-card',
  template: \`
    <div class="pricing-card">
      <div class="plan">{{ plan() }}</div>
      <div class="price">{{ price() }}</div>
      <ul>@for (f of features(); track f) { <li>{{ f }}</li> }</ul>
      <button (click)="ctx.emit('select', { plan: plan() })">
        Choose {{ plan() }}
      </button>
    </div>
  \`,
})
export class PricingCard {
  plan = input('');
  price = input('');
  features = input<string[]>([]);
  featured = input(false);
  protected ctx = inject(JR_CONTEXT);   // raise named events
}

// Register under a catalog 'type' and merge with the built-ins:
export const registry = mergeRegistries(
  primitivesRegistry,
  defineRegistry({ PricingCard }),
);`;

@Component({
  selector: 'app-custom',
  imports: [DocsExample],
  template: `
    <div class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Custom components</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Generative UI gets useful when the model builds screens from
        <strong>your</strong> components: your pricing card, your order table,
        your design system. Any standalone Angular component works. Props map to
        <code>input()</code>, children go through <code>&lt;ng-content&gt;</code>,
        and events use the injected <code>JR_CONTEXT</code>. Add it to the
        <strong>registry</strong> under a <code>type</code> so Angular can draw
        it, and to your <strong>catalog</strong> (with a description) so the
        model knows it exists.
      </p>
    </div>

    <app-docs-example
      title="A custom PricingCard + Testimonial"
      description="Rendered with a registry that merges these two custom components on top of the primitives. Click a plan — it emits the choose_plan action."
      [spec]="pricingSpec"
      [registry]="registry"
    />

    <h2 class="mt-10 mb-3 text-lg font-semibold">How it's built</h2>
    <pre
      class="overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-sm leading-relaxed text-zinc-100 dark:border-zinc-800"
    ><code>{{ source }}</code></pre>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPage {
  protected readonly pricingSpec = PRICING_SPEC;
  protected readonly registry = customRegistry;
  protected readonly source = COMPONENT_SOURCE;
}
