import type { Spec } from '@ng-json-render/core';
import { renderSpec } from '@ng-json-render/core/testing';
import { primitivesRegistry } from './registry';

describe('primitives', () => {
  it('renders a nested Card > Text/Button spec', () => {
    const spec: Spec = {
      root: 'root',
      elements: {
        root: { type: 'Stack', props: { gap: 12 }, children: ['card'] },
        card: {
          type: 'Card',
          props: { title: 'Hello' },
          children: ['text', 'btn'],
        },
        text: { type: 'Text', props: { value: 'Body copy' } },
        btn: {
          type: 'Button',
          props: { label: 'Save' },
          on: { press: { action: 'save' } },
        },
      },
    };

    const r = renderSpec(spec, { registry: primitivesRegistry });

    expect(r.query('jr-stack')).toBeTruthy();
    expect(r.query('jr-card')?.textContent).toContain('Hello');
    expect(r.query('jr-text')?.textContent).toContain('Body copy');
    expect(r.query('button')?.textContent).toContain('Save');
  });

  it('renders data-viz: Stat, BarChart, LineChart, Table', () => {
    const spec: Spec = {
      root: 'grid',
      elements: {
        grid: {
          type: 'Grid',
          props: { columns: 2 },
          children: ['stat', 'bar', 'line', 'table'],
        },
        stat: {
          type: 'Stat',
          props: { label: 'Revenue', value: '$12k', delta: 8 },
        },
        bar: {
          type: 'BarChart',
          props: {
            data: [
              { label: 'A', value: 3 },
              { label: 'B', value: 7 },
            ],
          },
        },
        line: { type: 'LineChart', props: { data: [1, 4, 2, 8, 5] } },
        table: {
          type: 'Table',
          props: {
            columns: ['name', 'plan'],
            rows: [{ name: 'Ada', plan: 'Pro' }],
          },
        },
      },
    };

    const r = renderSpec(spec, { registry: primitivesRegistry });
    expect(r.query('jr-stat')?.textContent).toContain('Revenue');
    expect(r.queryAll('svg').length).toBeGreaterThan(0);
    expect(r.host.querySelector('table')).toBeTruthy();
    expect(r.host.querySelector('table')?.textContent).toContain('Ada');
  });

  it('two-way binds an Input to state via $bindState', async () => {
    const spec: Spec = {
      root: 'input',
      elements: {
        input: {
          type: 'Input',
          props: { label: 'Name', value: { $bindState: '/name' } },
        },
      },
      state: { name: 'Ada' },
    };

    const r = renderSpec(spec, { registry: primitivesRegistry });
    const el = r.query('input') as HTMLInputElement;
    expect(el.value).toBe('Ada');

    // Simulate user typing → state updates through the model bridge.
    el.value = 'Grace';
    el.dispatchEvent(new Event('input'));
    await r.fixture.whenStable();
    expect(el.value).toBe('Grace');
  });

  it('writes $bindState edits back to state for other readers', async () => {
    const spec: Spec = {
      root: 'root',
      elements: {
        root: { type: 'Stack', props: {}, children: ['input', 'echo'] },
        input: { type: 'Input', props: { value: { $bindState: '/name' } } },
        echo: { type: 'Text', props: { value: { $state: '/name' } } },
      },
      state: { name: 'Ada' },
    };

    const r = renderSpec(spec, { registry: primitivesRegistry });
    const el = r.query('input') as HTMLInputElement;
    el.value = 'Grace';
    el.dispatchEvent(new Event('input'));
    await r.fixture.whenStable();
    expect(r.query('jr-text')?.textContent).toContain('Grace');
  });

  it('emits the press action from a Button', () => {
    const spec: Spec = {
      root: 'btn',
      elements: {
        btn: {
          type: 'Button',
          props: { label: 'Go' },
          on: { press: { action: 'go' } },
        },
      },
    };

    const r = renderSpec(spec, { registry: primitivesRegistry });
    r.query('button')?.click();
    expect(r.actions.map((a) => a.action)).toEqual(['go']);
  });
});
