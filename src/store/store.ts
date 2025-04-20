/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

import { Options, Store } from "./store.interface";

/**
 * `createStore` is a function that creates a store object for managing state.
 * @see https://react.dev/reference/react/useSyncExternalStore
 */
export const createStore = (
  options: Options = {
    initialStoreData: {},
  },
): Store => {
  const { initialStoreData: initialStore = {} } = options;
  const store: Store = {
    _store: initialStore,
    _listenerList: [],
    _emit: () => {
      for (const listener of store._listenerList) {
        listener();
      }
    },
    _reset: () => {
      store._store = {};
      store._emit();
    },
    set: (id, data, silent = false) => {
      const prevData = store._store[id];
      store._store = {
        ...store._store,
        [id]: { ...prevData, ...data },
      };
      if (silent === false) {
        store._emit();
      }
    },
    get: (id) => {
      return store._store[id];
    },
    has: (id) => {
      return id in store._store;
    },
    subscribe: (listener) => {
      store._listenerList.push(listener);
      return () => {
        store._listenerList = store._listenerList.filter(
          (currentListener) => currentListener !== listener,
        );
      };
    },
    getSnapshot: () => {
      return store._store;
    },
  };
  return store;
};

export default createStore;
