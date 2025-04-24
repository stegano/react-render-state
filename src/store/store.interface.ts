import type { Status } from "../hooks/use-render-state.interface";

/**
 * RenderStateData
 */
export interface RenderStateData {
  /**
   * initialData
   */
  initialData?: any;
  /**
   * initialError
   */
  initialError?: any;
  /**
   * currentData
   */
  currentData?: any;
  /**
   * previousData
   */
  previousData?: any;
  /**
   * currentError
   */
  currentError?: any;
  /**
   * previousError
   */
  previousError?: any;
  /**
   * status
   */
  status: Status;
  /**
   * latestUpdatedId
   */
  latestUpdatedId: string;
}

/**
 * `createStore` function options
 */
export interface Options {
  initialStoreData?: Record<string, RenderStateData>;
}

/**
 * Listener
 */
export interface Listener {
  (): void;
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
  _emit: () => void;
  /**
   * Get data from the internal data store
   */
  get: (id: string) => RenderStateData;
  /**
   * Set data in the internal data store
   */
  set: (id: string, data: RenderStateData, partial?: boolean, silent?: boolean) => void;
  /**
   * Register an event listener in the store to detect changes
   */
  subscribe: (listener: Listener) => () => void;
  /**
   * Get a snapshot of the data from the internal data store
   */
  getSnapshot: () => Record<string, RenderStateData>;
  /**
   * Check if the data exists in the internal data store
   */
  has: (id: string) => boolean;
  /**
   * Remove a data from the internal data store
   */
  remove: (id: string) => void;
}
