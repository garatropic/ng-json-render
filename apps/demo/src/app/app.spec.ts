import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appRoutes } from './app.routes';

describe('App shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('renders the brand and sidebar navigation', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('ng-json-render');
    const navLabels = Array.from(el.querySelectorAll('aside a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(navLabels).toEqual([
      'Overview',
      'Get started',
      'Generate UI with AI',
      'Dashboard',
      'Components',
      'Custom components',
    ]);
  });
});
