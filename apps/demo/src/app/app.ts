import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavLink {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div
      class="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <header
        class="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80"
      >
        <div
          class="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3"
        >
          <a routerLink="/" class="flex items-center gap-2 font-semibold">
            <span
              class="grid h-6 w-6 place-items-center rounded bg-indigo-600 text-xs text-white"
              >JR</span
            >
            ng-json-render
          </a>
          <nav class="flex items-center gap-4 text-xs">
            <a
              href="https://json-render.dev/docs"
              target="_blank"
              rel="noreferrer"
              class="hidden font-medium text-indigo-600 hover:underline sm:inline dark:text-indigo-400"
              >json-render docs</a
            >
            <a
              href="https://github.com/garatropic/ng-json-render"
              target="_blank"
              rel="noreferrer"
              class="font-medium text-zinc-600 hover:underline dark:text-zinc-300"
              >GitHub</a
            >
          </nav>
        </div>

        <!-- Mobile nav: the sidebar is hidden below md. -->
        <nav
          class="flex gap-1 overflow-x-auto border-t border-zinc-200 px-4 py-2 text-sm md:hidden dark:border-zinc-800"
        >
          @for (link of nav; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="shrink-0 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap text-zinc-600 dark:text-zinc-400"
            >
              {{ link.label }}
            </a>
          }
        </nav>
      </header>

      <div class="mx-auto flex max-w-[1600px] gap-10 px-6 py-10 lg:px-10">
        <aside class="hidden w-60 shrink-0 md:block">
          <nav class="sticky top-24 flex flex-col gap-1 text-base">
            @for (link of nav; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                [routerLinkActiveOptions]="{ exact: link.exact }"
                class="rounded-lg px-3 py-2 font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                {{ link.label }}
              </a>
            }
          </nav>
        </aside>

        <main class="min-w-0 flex-1">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly nav: NavLink[] = [
    { path: '/', label: 'Overview', exact: true },
    { path: '/start', label: 'Get started', exact: false },
    { path: '/ai', label: 'Generate UI with AI', exact: false },
    { path: '/dashboard', label: 'Dashboard', exact: false },
    { path: '/components', label: 'Components', exact: false },
    { path: '/custom', label: 'Custom components', exact: false },
  ];
}
