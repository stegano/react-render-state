import { useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { RenderStateContext } from "../providers/render-state";
import useRenderState from "./use-render-state";
import { Status } from "./use-render-state.interface";

/**
 * useRenderStateManagement
 */
const useRenderStateManagement = <Data, Error>(
  initialData?: Data,
  initialError?: Error,
  key?: string,
) => {
  const context = useContext(RenderStateContext);
  const store = useMemo(() => context.getStore(), [context]);
  const globalStore = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const globalStoreItem = useMemo(() => {
    if (key === undefined) {
      return undefined;
    }
    return globalStore[key];
  }, [globalStore, key]);

  const currentInitialData = useMemo(() => {
    if (key === undefined) {
      return initialData;
    }
    /**
     * If the global store item has currentData, return it.
     */
    if (globalStoreItem?.currentData) {
      return globalStoreItem.currentData;
    }
    return globalStoreItem?.initialData ?? initialData;
  }, [globalStoreItem?.currentData, globalStoreItem?.initialData, initialData, key]);

  const currentInitialError = useMemo(() => {
    /**
     * If the global store item has currentError, return it.
     */
    if (globalStoreItem?.currentError) {
      return globalStoreItem.currentError;
    }
    return globalStoreItem?.initialError ?? initialError;
  }, [globalStoreItem?.currentError, globalStoreItem?.initialError, initialError]);

  const [
    render,
    handleData,
    resetData,
    status,
    currentData,
    currentError,
    previousData,
    previousError,
    manipulation,
    id,
  ] = useRenderState<Data, Error>(currentInitialData, currentInitialError);

  useEffect(() => {
    if (key === undefined) {
      return;
    }
    /**
     * Set initial data and error to the global store.
     */
    const currentGlobalStoreItem = globalStore[key];
    if (currentGlobalStoreItem === undefined) {
      let nextStatus = Status.Idle;
      if (initialData) {
        nextStatus = Status.Success;
      } else if (initialError) {
        nextStatus = Status.Error;
      }
      store.set(key, {
        initialData,
        initialError,
        status: nextStatus,
        latestUpdatedId: id,
      });
    }
  }, [key, globalStore, initialData, initialError, store, id]);

  useEffect(() => {
    /**
     * Synchronize local data and status with globalStore.
     */
    if (key === undefined) {
      return;
    }
    if (globalStoreItem === undefined || globalStoreItem.latestUpdatedId === id) {
      return;
    }
    manipulation({
      previousData: currentData,
      previousError: currentError,
      currentData: globalStoreItem?.currentData,
      currentError: globalStoreItem?.currentError,
      status: globalStoreItem?.status,
    });
  }, [
    id,
    key,
    store,
    currentData,
    currentError,
    status,
    previousData,
    previousError,
    globalStoreItem,
    manipulation,
  ]);

  const handleShareData = useCallback(
    async (
      processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data,
    ): Promise<Data> => {
      let tempData: Data;
      let tempPreviousData: Data | undefined;
      let tempPreviousError: Error | undefined;
      try {
        return await handleData(async (_previousData, _previousError) => {
          tempPreviousData = _previousData;
          tempPreviousError = _previousError;
          if (key !== undefined) {
            store.set(key, {
              previousData: _previousData,
              previousError: _previousError,
              currentData: undefined,
              currentError: undefined,
              status: Status.Loading,
              latestUpdatedId: id,
            });
          }
          tempData = await processFn(_previousData, _previousError);
          /**
           * Update local data to global store.
           */
          if (key !== undefined) {
            store.set(key, {
              currentData: tempData,
              status: Status.Success,
              latestUpdatedId: id,
            });
          }
          return tempData;
        });
      } catch (error) {
        /**
         * Update local data to global store.
         */
        if (key !== undefined) {
          store.set(key, {
            previousData: tempPreviousData,
            previousError: tempPreviousError,
            currentData: undefined,
            currentError: error as Error,
            status: Status.Error,
            latestUpdatedId: id,
          });
        }
        throw error;
      }
    },
    [handleData, id, key, store],
  );

  return [
    render,
    handleShareData,
    resetData,
    status,
    currentData,
    currentError,
    previousData,
    previousError,
    manipulation,
    key,
  ] as const;
};

export default useRenderStateManagement;
