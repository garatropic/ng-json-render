import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Spec } from '@ng-json-render/core';
import { DocsExample } from '../shared/app-docs-example';
import {
  CONTENT_SPEC,
  DATAVIZ_SPEC,
  FEEDBACK_SPEC,
  FORMS_SPEC,
  LAYOUT_SPEC,
} from '../examples';

interface Section {
  title: string;
  description: string;
  spec: Spec;
}

@Component({
  selector: 'app-components',
  imports: [DocsExample],
  template: `
    <div class="mb-8 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Components</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        <code>&#64;ng-json-render/primitives</code> ships 20 Tailwind-styled,
        dark-mode-ready components and <code>primitivesRegistry</code>, so you
        can render specs before writing any components of your own. To let a
        model use them, list them in your catalog. Each block below is a live
        render on the left and the exact spec on the right.
      </p>
    </div>

    <div class="flex flex-col gap-12">
      @for (s of sections; track s.title) {
        <app-docs-example
          [title]="s.title"
          [description]="s.description"
          [spec]="s.spec"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentsPage {
  protected readonly sections: Section[] = [
    {
      title: 'Layout',
      description: 'Container, Stack, Grid, Card, Divider — structure and spacing.',
      spec: LAYOUT_SPEC,
    },
    {
      title: 'Content',
      description: 'Heading, Text, Badge, Stat — typography and status.',
      spec: CONTENT_SPEC,
    },
    {
      title: 'Feedback',
      description: 'Alert and Progress — inline status and determinate progress.',
      spec: FEEDBACK_SPEC,
    },
    {
      title: 'Data visualization',
      description: 'BarChart, LineChart, Table — dependency-free SVG/CSS charts.',
      spec: DATAVIZ_SPEC,
    },
    {
      title: 'Forms',
      description:
        'Input, Textarea, Select, Checkbox, Switch, Button — Signal Forms controls, two-way bound via $bindState.',
      spec: FORMS_SPEC,
    },
  ];
}
