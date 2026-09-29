import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { renderSpec } from '@ng-json-render/core/testing';
import { JR_CONTEXT } from './jr-context';
import { defineRegistry } from './registry';
import type { Spec } from './types';

@Component({
  selector: 'jr-test-box',
  template: `<div class="box">{{ label() }}<ng-content /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestBox {
  readonly label = input('');
}

@Component({
  selector: 'jr-test-btn',
  template: `<button (click)="ctx.emit('press')">{{ label() }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestBtn {
  readonly label = input('');
  protected readonly ctx = inject(JR_CONTEXT);
}

const registry = defineRegistry({ Box: TestBox, Btn: TestBtn });

describe('JrRenderer', () => {
  it('renders a single element with a discrete input bound from props', () => {
    const spec: Spec = {
      root: 'a',
      elements: { a: { type: 'Box', props: { label: 'Hello' } } },
    };
    const r = renderSpec(spec, { registry });
    expect(r.query('.box')?.textContent).toContain('Hello');
  });

  it('projects children into <ng-content> (nested tree)', () => {
    const spec: Spec = {
      root: 'outer',
      elements: {
        outer: { type: 'Box', props: { label: 'O:' }, children: ['inner'] },
        inner: { type: 'Box', props: { label: 'I' } },
      },
    };
    const r = renderSpec(spec, { registry });
    const outer = r.query('.box');
    expect(outer?.textContent).toContain('O:');
    // Inner box is nested within the outer box's projected content.
    expect(outer?.querySelector('.box')?.textContent).toContain('I');
  });

  it('resolves $state expressions in props against state', () => {
    const spec: Spec = {
      root: 'a',
      elements: { a: { type: 'Box', props: { label: { $state: '/name' } } } },
      state: { name: 'FromState' },
    };
    const r = renderSpec(spec, { registry });
    expect(r.query('.box')?.textContent).toContain('FromState');
  });

  it('routes emitted events to the (action) output using the `on` binding', () => {
    const spec: Spec = {
      root: 'b',
      elements: {
        b: {
          type: 'Btn',
          props: { label: 'Go' },
          on: { press: { action: 'submitForm' } },
        },
      },
    };
    const r = renderSpec(spec, { registry });
    r.query('button')?.click();
    expect(r.actions.length).toBe(1);
    expect(r.actions[0].action).toBe('submitForm');
    expect(r.actions[0].nodeId).toBe('b');
  });

  it('dispatches actions to provided handlers', () => {
    const calls: string[] = [];
    const spec: Spec = {
      root: 'b',
      elements: {
        b: { type: 'Btn', props: {}, on: { press: { action: 'save' } } },
      },
    };
    const r = renderSpec(spec, {
      registry,
      actions: {
        save: (ctx) => {
          calls.push(ctx.action);
        },
      },
    });
    r.query('button')?.click();
    expect(calls).toEqual(['save']);
  });

  it('skips elements hidden by a visibility condition', () => {
    const spec: Spec = {
      root: 'root',
      elements: {
        root: { type: 'Box', props: {}, children: ['shown', 'hidden'] },
        shown: { type: 'Box', props: { label: 'shown' } },
        hidden: {
          type: 'Box',
          props: { label: 'hidden' },
          visible: { $state: '/flag' },
        },
      },
      state: { flag: false },
    };
    const r = renderSpec(spec, { registry });
    expect(r.host.textContent).toContain('shown');
    expect(r.host.textContent).not.toContain('hidden');
  });

  it('clears the output when the spec is set back to null', async () => {
    const r = renderSpec(
      { root: 'a', elements: { a: { type: 'Box', props: { label: 'Hi' } } } },
      { registry },
    );
    expect(r.query('.box')).toBeTruthy();
    r.fixture.componentRef.setInput('spec', null);
    await r.fixture.whenStable();
    expect(r.query('.box')).toBeNull();
  });

  it('rebuilds when the registry input changes', async () => {
    const spec: Spec = {
      root: 'a',
      elements: { a: { type: 'Box', props: { label: 'Hi' } } },
    };
    const r = renderSpec(spec, { registry: defineRegistry({}) });
    expect(r.query('.box')).toBeNull();
    r.fixture.componentRef.setInput('registry', registry);
    await r.fixture.whenStable();
    expect(r.query('.box')?.textContent).toContain('Hi');
  });

  it('skips cyclic children instead of recursing forever', () => {
    const spec: Spec = {
      root: 'a',
      elements: {
        a: { type: 'Box', props: { label: 'A' }, children: ['b'] },
        b: { type: 'Box', props: { label: 'B' }, children: ['a'] },
      },
    };
    const r = renderSpec(spec, { registry });
    expect(r.queryAll('.box').length).toBe(2);
  });

  it('renders an element referenced more than once only once', () => {
    // Each element lists the next one twice: without a guard this builds 2^N nodes.
    const n = 30;
    const elements: Spec['elements'] = {};
    for (let i = 0; i < n; i++) {
      elements[`e${i}`] = {
        type: 'Box',
        props: {},
        children: i < n - 1 ? [`e${i + 1}`, `e${i + 1}`] : [],
      };
    }
    const r = renderSpec({ root: 'e0', elements }, { registry });
    expect(r.queryAll('.box').length).toBe(n);
  });

  it('skips types that name prototype members instead of crashing', () => {
    const spec: Spec = {
      root: 'root',
      elements: {
        root: { type: 'Box', props: { label: 'ok' }, children: ['bad'] },
        bad: { type: 'constructor', props: {} },
      },
    };
    const r = renderSpec(spec, { registry });
    expect(r.query('.box')?.textContent).toContain('ok');
  });
});
