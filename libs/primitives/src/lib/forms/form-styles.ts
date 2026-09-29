// Note: these controls expose a `value` / `checked` model(), which *structurally*
// satisfies Angular's Signal Forms `FormValueControl` / `FormCheckboxControl`
// contracts — so on Angular 21 they work with the `[field]` directive — without
// importing `@angular/forms/signals`, keeping the package usable on Angular 19+.

/** Classes shared by the labelled text controls (Input, Textarea, Select). */
export const FIELD_LABEL =
  'text-sm font-medium text-zinc-700 dark:text-zinc-300';
export const CONTROL =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';
