import { TestBed } from '@angular/core/testing';
import type { Spec, UIElement } from '@ng-json-render/core';
import { renderSpec } from '@ng-json-render/core/testing';
import { primitivesRegistry } from './registry';

/** Render a single element (plus optional children) and return its host node. */
function render(
  type: string,
  props: Record<string, unknown>,
  extra: Record<string, UIElement> = {},
  state?: Record<string, unknown>,
) {
  const children = Object.keys(extra);
  const spec: Spec = {
    root: 'el',
    ...(state ? { state } : {}),
    elements: {
      el: { type, props, ...(children.length ? { children } : {}) },
      ...extra,
    },
  };
  const r = renderSpec(spec, { registry: primitivesRegistry });
  return {
    ...r,
    el: r.query(`jr-${kebab(type)}`) as HTMLElement,
  };
}

function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

describe('primitive rendering', () => {
  // ── layout ──────────────────────────────────────────────
  it('Container applies a max-width', () => {
    const { el } = render('Container', { maxWidth: 720 });
    expect(el.style.maxWidth).toBe('720px');
  });

  it('Stack lays out as flex with gap and direction', () => {
    const { el } = render('Stack', { direction: 'row', gap: 24 });
    expect(el.style.display).toBe('flex');
    expect(el.style.flexDirection).toBe('row');
    expect(el.style.gap).toBe('24px');
  });

  it('Grid sets a responsive template for its column count', () => {
    const { el } = render('Grid', { columns: 3 });
    expect(el.style.display).toBe('grid');
    // Responsive: auto-fit tracks that collapse below a min width, targeting 3 columns.
    expect(el.style.gridTemplateColumns).toContain('auto-fit');
    expect(el.style.gridTemplateColumns).toContain('/ 3');
  });

  it('Card shows title, subtitle, and projects children', () => {
    const { el } = render(
      'Card',
      { title: 'Billing', subtitle: 'Monthly' },
      { body: { type: 'Text', props: { value: 'Inside' } } },
    );
    expect(el.textContent).toContain('Billing');
    expect(el.textContent).toContain('Monthly');
    expect(el.querySelector('jr-text')?.textContent).toContain('Inside');
  });

  it('Divider renders a separator', () => {
    const { el } = render('Divider', {});
    expect(el.getAttribute('role')).toBe('separator');
  });

  // ── content ─────────────────────────────────────────────
  it('Heading renders its value at the requested level', () => {
    const { el } = render('Heading', { value: 'Dashboard', level: 1 });
    expect(el.textContent).toContain('Dashboard');
    expect(el.className).toContain('text-3xl');
    expect(el.getAttribute('role')).toBe('heading');
    expect(el.getAttribute('aria-level')).toBe('1');
  });

  it('Heading falls back to the default size for an unknown level', () => {
    const { el } = render('Heading', { value: 'X', level: 9 });
    expect(el.className).toContain('text-2xl');
    expect(el.className).not.toContain('undefined');
  });

  it('Text renders its value', () => {
    const { el } = render('Text', { value: 'Body copy', weight: 'medium' });
    expect(el.textContent).toContain('Body copy');
  });

  it('Badge renders label with tone styling', () => {
    const { el } = render('Badge', { label: 'Active', tone: 'success' });
    expect(el.textContent).toContain('Active');
    expect(el.className).toContain('emerald');
  });

  it('Stat renders value and a positive delta indicator', () => {
    const { el } = render('Stat', {
      label: 'Revenue',
      value: '$1k',
      delta: 12,
    });
    expect(el.textContent).toContain('Revenue');
    expect(el.textContent).toContain('$1k');
    expect(el.textContent).toContain('▲');
    expect(el.textContent).toContain('12');
  });

  it('Stat shows a downward indicator for negative deltas', () => {
    const { el } = render('Stat', { label: 'Churn', value: '2%', delta: -3 });
    expect(el.textContent).toContain('▼');
    expect(el.querySelector('.sr-only')?.textContent).toBe('down');
  });

  // ── feedback ────────────────────────────────────────────
  it('Alert renders title, message, and alert role', () => {
    const { el } = render('Alert', {
      title: 'Heads up',
      message: 'Something happened',
      tone: 'warning',
    });
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.textContent).toContain('Heads up');
    expect(el.textContent).toContain('Something happened');
  });

  it('Alert uses a polite status role for info', () => {
    const { el } = render('Alert', { message: 'FYI', tone: 'info' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('Progress renders a clamped width', () => {
    const { el } = render('Progress', { value: 140, label: 'Storage' });
    const bar = el.querySelector<HTMLElement>('[style*="width"]');
    expect(bar?.style.width).toBe('100%');
    expect(el.textContent).toContain('Storage');
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('100');
    expect(el.getAttribute('aria-label')).toBe('Storage');
  });

  // ── data-viz ────────────────────────────────────────────
  it('BarChart renders one bar per datum', () => {
    const { el } = render('BarChart', {
      data: [
        { label: 'A', value: 3 },
        { label: 'B', value: 9 },
        { label: 'C', value: 6 },
      ],
    });
    expect(el.querySelectorAll('[title]').length).toBe(3);
    expect(el.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'A: 3',
    );
    expect(el.textContent).toContain('A');
    expect(el.textContent).toContain('C');
  });

  it('LineChart renders an svg polyline when it has data', () => {
    const { el } = render('LineChart', { data: [1, 5, 2, 8] });
    expect(el.querySelector('svg')).toBeTruthy();
    expect(el.querySelector('polyline')).toBeTruthy();
    expect(el.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('LineChart exposes a label to assistive tech', () => {
    const { el } = render('LineChart', { data: [1, 2], label: 'Signups' });
    const svg = el.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Signups');
    expect(svg?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('Table renders headers and cell values', () => {
    const { el } = render('Table', {
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
      ],
      rows: [
        { name: 'Ada', role: 'Eng' },
        { name: 'Grace', role: 'Admiral' },
      ],
    });
    expect(el.querySelector('th')?.getAttribute('scope')).toBe('col');
    const headers = Array.from(el.querySelectorAll('th')).map((th) =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual(['Name', 'Role']);
    expect(el.querySelectorAll('tbody tr').length).toBe(2);
    expect(el.textContent).toContain('Admiral');
  });

  // ── forms ───────────────────────────────────────────────
  it('Input renders a labelled text field', () => {
    const { el } = render('Input', {
      label: 'Email',
      placeholder: 'you@co',
      type: 'email',
    });
    const input = el.querySelector('input') as HTMLInputElement;
    expect(el.textContent).toContain('Email');
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@co');
  });

  it('Textarea renders a multi-line field', () => {
    const { el } = render('Textarea', { label: 'Bio', rows: 5 });
    const ta = el.querySelector('textarea') as HTMLTextAreaElement;
    expect(el.textContent).toContain('Bio');
    expect(ta.rows).toBe(5);
  });

  it('Select renders its options', () => {
    const { el } = render('Select', {
      label: 'Plan',
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro' },
      ],
    });
    const opts = Array.from(el.querySelectorAll('option')).map((o) =>
      o.textContent?.trim(),
    );
    expect(opts).toContain('Free');
    expect(opts).toContain('Pro');
  });

  it('Select shows a preset bound value', () => {
    const { el } = render(
      'Select',
      {
        options: ['free', 'pro', 'team'],
        value: { $bindState: '/plan' },
      },
      {},
      { plan: 'pro' },
    );
    expect((el.querySelector('select') as HTMLSelectElement).value).toBe('pro');
  });

  it('Checkbox reflects its checked state from bound data', () => {
    const { el } = render(
      'Checkbox',
      { label: 'Agree', checked: { $bindState: '/agree' } },
      {},
      { agree: true },
    );
    const box = el.querySelector('input') as HTMLInputElement;
    expect(el.textContent).toContain('Agree');
    expect(box.checked).toBe(true);
  });

  it('Switch exposes an aria-checked toggle', () => {
    const { el } = render(
      'Switch',
      { label: 'Notify', checked: { $bindState: '/notify' } },
      {},
      { notify: true },
    );
    const sw = el.querySelector('[role="switch"]') as HTMLElement;
    expect(el.textContent).toContain('Notify');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    expect(sw.getAttribute('aria-label')).toBe('Notify');
  });

  it('Button renders its label and emits press', () => {
    const spec: Spec = {
      root: 'b',
      elements: {
        b: {
          type: 'Button',
          props: { label: 'Continue' },
          on: { press: { action: 'next' } },
        },
      },
    };
    const r = renderSpec(spec, { registry: primitivesRegistry });
    const btn = r.query('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Continue');
    btn.click();
    expect(r.actions.map((a) => a.action)).toEqual(['next']);
  });

  // ── registry coverage guard ─────────────────────────────
  it('every registered component renders without error', () => {
    const types = Object.keys(primitivesRegistry.components);
    for (const type of types) {
      TestBed.resetTestingModule();
      const spec: Spec = {
        root: 'x',
        elements: { x: { type, props: {} } },
      };
      expect(() =>
        renderSpec(spec, { registry: primitivesRegistry }),
      ).not.toThrow();
    }
    // Sanity: the catalog is the size we expect.
    expect(types.length).toBeGreaterThanOrEqual(19);
  });
});
