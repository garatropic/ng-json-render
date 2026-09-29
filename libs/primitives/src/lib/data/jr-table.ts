import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** A table column, either a bare key or a key/label pair. */
export type JrTableColumn = string | { key: string; label?: string };

/** Simple data table. */
@Component({
  selector: 'jr-table',
  template: `
    <div
      class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800"
    >
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-zinc-50 dark:bg-zinc-800/50">
            @for (col of cols(); track col.key) {
              <th
                scope="col"
                class="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400"
              >
                {{ col.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr class="border-t border-zinc-100 dark:border-zinc-800/70">
              @for (col of cols(); track col.key) {
                <td class="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                  {{ cell(row, col.key) }}
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class JrTable {
  readonly columns = input<JrTableColumn[]>([]);
  readonly rows = input<Record<string, unknown>[]>([]);

  protected readonly cols = computed(() =>
    this.columns().map((c) =>
      typeof c === 'string'
        ? { key: c, label: c }
        : { key: c.key, label: c.label ?? c.key },
    ),
  );

  protected cell(row: Record<string, unknown>, key: string): string {
    const v = row[key];
    return v == null ? '' : String(v);
  }
}
