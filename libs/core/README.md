# @ng-json-render/core

Angular renderer for [json-render](https://json-render.dev). Renders a JSON spec, written by an AI model or your server, using your own Angular components.

[Docs](https://mainawycliffe.github.io/ng-json-render/) · [GitHub](https://github.com/mainawycliffe/ng-json-render)

json-render is a framework for generative UI: a model generates a UI as JSON, using only the components and actions in your catalog. This package renders that JSON with Angular components. The catalog, spec format, prompts and streaming come from `@json-render/core`.

## Install

```sh
npm i @ng-json-render/core @json-render/core
```

Requires Angular 19–22.

## Usage

```ts
import { Component, signal } from '@angular/core';
import { JrRenderer, type JrActionEvent, type Spec } from '@ng-json-render/core';
import { primitivesRegistry } from '@ng-json-render/primitives';

@Component({
  selector: 'app-root',
  imports: [JrRenderer],
  template: `<jr-renderer [spec]="spec()" [registry]="registry" (action)="onAction($event)" />`,
})
export class App {
  registry = primitivesRegistry;
  spec = signal<Spec>({
    root: 'root',
    elements: {
      root: { type: 'Stack', props: { gap: 16 }, children: ['title', 'save'] },
      title: { type: 'Text', props: { value: 'Hello', weight: 'bold' } },
      save: { type: 'Button', props: { label: 'Save' }, on: { press: { action: 'save' } } },
    },
  });
  onAction(e: JrActionEvent) { console.log(e.action, e.nodeId); }
}
```

## Documentation

The [project README](https://github.com/mainawycliffe/ng-json-render#readme) covers:

- [Spec format](https://github.com/mainawycliffe/ng-json-render#spec-format)
- [Generating specs with AI](https://github.com/mainawycliffe/ng-json-render#generating-specs-with-ai)
- [Custom components](https://github.com/mainawycliffe/ng-json-render#custom-components)
- [Actions](https://github.com/mainawycliffe/ng-json-render#actions)
- [Feature support](https://github.com/mainawycliffe/ng-json-render#feature-support)
- [Testing](https://github.com/mainawycliffe/ng-json-render#testing) with `@ng-json-render/core/testing`
