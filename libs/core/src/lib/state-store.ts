import {
  DestroyRef,
  Injectable,
  type Signal,
  inject,
  signal,
} from '@angular/core';
import {
  type Spec,
  type StateModel,
  type StateStore,
  type UIElement,
  createStateStore,
} from '@json-render/core';

/**
 * Signal-based store that owns the current {@link Spec} and its runtime state.
 *
 * All calls into `@json-render/core` state utilities are funnelled through here
 * so the rest of the engine depends on a single, stable surface. State changes
 * from `@json-render/core`'s in-memory store are mirrored into an Angular signal
 * (`state`) so templates and prop resolution stay reactive under zoneless CD.
 */
@Injectable()
export class JrStateStore {
  private readonly _spec = signal<Spec | null>(null);
  /** The current spec, or `null` before one is set. */
  readonly spec: Signal<Spec | null> = this._spec.asReadonly();

  // `equal: () => false` forces the signal to notify on every store change even
  // when the core store mutates the snapshot in place.
  private readonly _state = signal<StateModel>(
    {},
    { equal: () => false },
  );
  /** The current runtime state model. */
  readonly state: Signal<StateModel> = this._state.asReadonly();

  private store: StateStore = createStateStore({});
  private unsubscribe?: () => void;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.unsubscribe?.());
  }

  /**
   * Replace the spec and re-seed runtime state from `spec.state`. `null` clears
   * the spec and resets state.
   */
  setSpec(spec: Spec | null): void {
    this._spec.set(spec);
    this.unsubscribe?.();
    this.store = createStateStore(spec?.state ?? {});
    this.unsubscribe = this.store.subscribe(() =>
      this._state.set(this.store.getSnapshot()),
    );
    this._state.set(this.store.getSnapshot());
  }

  /** Merge additional state on top of the current model. */
  patchState(state: StateModel): void {
    this.store.update(state);
  }

  /** Look up an element by id in the current spec. */
  getElement(id: string): UIElement | undefined {
    return this._spec()?.elements[id];
  }

  /** Read a value from state by JSON Pointer path. */
  getStatePath(path: string): unknown {
    return this.store.get(path);
  }

  /** Write a value into state by JSON Pointer path (notifies subscribers). */
  setStatePath(path: string, value: unknown): void {
    this.store.set(path, value);
  }

  /** Current full state snapshot (non-reactive read). */
  snapshot(): StateModel {
    return this.store.getSnapshot();
  }
}
