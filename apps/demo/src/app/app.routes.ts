import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    title: 'ng-json-render · Overview',
    loadComponent: () =>
      import('./pages/overview.page').then((m) => m.OverviewPage),
  },
  {
    path: 'start',
    title: 'ng-json-render · Get started',
    loadComponent: () =>
      import('./pages/getting-started.page').then((m) => m.GettingStartedPage),
  },
  {
    path: 'ai',
    title: 'ng-json-render · Generate UI with AI',
    loadComponent: () => import('./pages/ai.page').then((m) => m.AiPage),
  },
  {
    path: 'dashboard',
    title: 'ng-json-render · Dashboard',
    loadComponent: () =>
      import('./pages/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'components',
    title: 'ng-json-render · Components',
    loadComponent: () =>
      import('./pages/components.page').then((m) => m.ComponentsPage),
  },
  {
    path: 'custom',
    title: 'ng-json-render · Custom components',
    loadComponent: () =>
      import('./pages/custom.page').then((m) => m.CustomPage),
  },
  { path: '**', redirectTo: '' },
];
