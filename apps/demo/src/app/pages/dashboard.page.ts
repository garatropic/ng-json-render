import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type JrActionEvent, JrRenderer } from '@ng-json-render/core';
import { DEMO_SPEC } from '../demo-spec';

@Component({
  selector: 'app-dashboard',
  imports: [JrRenderer],
  template: `
    <div class="mb-6 max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">Dashboard example</h1>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        An analytics dashboard (stats, charts, table and a bound settings
        form) rendered from one spec.
      </p>
    </div>

    <jr-renderer [spec]="spec()" (action)="onAction($event)" />

    @if (lastAction(); as a) {
      <div
        role="status"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      >
        Action dispatched: <code class="font-medium">{{ a }}</code>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly spec = signal(DEMO_SPEC);
  protected readonly lastAction = signal<string | null>(null);
  private hideTimer?: ReturnType<typeof setTimeout>;

  protected onAction(event: JrActionEvent): void {
    this.lastAction.set(`${event.action} (#${event.nodeId})`);
    // Restart the timer so an earlier click doesn't hide a newer message.
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.lastAction.set(null), 2500);
  }
}
