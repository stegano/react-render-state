import type { Status } from "../hooks/use-render-state.interface";

/**
 * RenderStateData
 */
export interface RenderStateData {
  /**
   * initialData
   */
  initialData: any;
  /**
   * initialError
   */
  initialError: any;
  /**
   * status
   */
  status: Status;
  /**
   * currentData
   */
  currentData: any;
  /**
   * previousData
   */
  previousData: any;
  /**
   * currentError
   */
  currentError: any;
  /**
   * previousError
   */
  previousError: any;
}

/**
 * Listener
 */
export interface Listener {
  (): void;
}

/**
 * `createStore` function options
 */
export interface Options {
  initialStoreData?: Record<string, RenderStateData>;
}

/**
 * Getter
 */
export interface Getter {
  (id: string): RenderStateData;
}

/**
 * Setter
 */
export interface Setter {
  (id: string, data: Partial<RenderStateData>, silent?: boolean): void;
}

/**
 * GetSnapshot
 */
export interface GetSnapshot {
  (): Record<string, RenderStateData>;
}

/**
 * Subscribe
 */
export interface Subscribe {
  (listener: Listener): () => void;
}

/**
 * Emit
 */
export interface Emit {
  (): void;
}

/**
 * Has
 */
export interface Has {
  (id: string): boolean;
}

/**
 * Store
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
export interface Store {
  /**
   * Data store
   */
  _store: Record<string, RenderStateData>;
  /**
   * Listener list
   */
  _listenerList: Listener[];
  /**
   * Reset the internal data store
   */
  _reset: () => void;
  /**
   * Event emitter
   */
  _emit: Emit;
  /**
   * Get data from the internal data store
   */
  get: Getter;
  /**
   * Set data in the internal data store
   */
  set: Setter;
  /**
   * Register an event listener in the store to detect changes
   */
  subscribe: Subscribe;
  /**
   * Get a snapshot of the data from the internal data store
   */
  getSnapshot: GetSnapshot;
  /**
   * Check if the data exists in the internal data store
   */
  has: Has;
}
