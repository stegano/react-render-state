import {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Status,
  RenderIdle,
  RenderSuccess,
  RenderLoading,
  RenderError,
} from "./use-render-state.interface";
import { RenderStateContext } from "../providers";

/**
 * useRenderState
 */
const useRenderState = <Data, Error>(initialData?: Data, initialError?: Error, key?: string) => {
  const currentKey = key ?? useId();
  const reenderStateContext = useContext(RenderStateContext);
  const store = useMemo(() => reenderStateContext.getStore(), [reenderStateContext]);
  const externalStore = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const externalStoreItem = useMemo(() => externalStore[currentKey], [currentKey, externalStore]);
  const previousDataRef = useRef<Data>(undefined);
  const previousErrorRef = useRef<Error>(undefined);
  const currentDataRef = useRef<Data | undefined>(externalStoreItem?.initialData ?? initialData);
  const currentErrorRef = useRef<Error | undefined>(
    externalStoreItem?.initialError ?? initialError,
  );
  const [status, setStatus] = useState<Status>(() => {
    if ((externalStoreItem?.initialData ?? initialData) !== undefined) {
      return Status.Success;
    }
    if ((externalStoreItem?.initialError ?? initialError) !== undefined) {
      return Status.Error;
    }
    return Status.Idle;
  });

  useEffect(() => {
    /**
     * Set initial data and error when the component is mounted.
     */
    store.set(
      currentKey,
      {
        status: Status.Idle,
        initialData: currentDataRef.current,
        initialError: currentErrorRef.current,
      },
      true,
    );
  }, [currentKey, store]);

  useEffect(() => {
    /**
     * Update component state when the external store item is updated.
     */
    if (externalStoreItem) {
      const { currentData, currentError, previousData, previousError } = externalStoreItem;
      currentDataRef.current = currentData;
      currentErrorRef.current = currentError;
      previousDataRef.current = previousData;
      previousErrorRef.current = previousError;
      setStatus(externalStoreItem.status);
    }
  }, [externalStoreItem]);

  /**
   * handleData
   */
  const handleData = useCallback(
    async (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => {
      try {
        store.set(currentKey, {
          status: Status.Loading,
          currentData: undefined,
          previousData: currentDataRef.current,
          currentError: undefined,
          previousError: currentErrorRef.current,
        });
        const data = await processFn(previousDataRef.current, previousErrorRef.current);
        store.set(currentKey, {
          status: Status.Success,
          currentData: data,
        });
      } catch (error) {
        store.set(currentKey, {
          status: Status.Error,
          currentError: error as Error,
        });
        throw error;
      }
    },
    [currentKey, store],
  );

  /**
   * resetData
   */
  const resetData = useCallback(() => {
    store.set(currentKey, {
      status: Status.Idle,
      currentData: undefined,
      previousData: currentDataRef.current,
      currentError: undefined,
      previousError: currentErrorRef.current,
    });
  }, [currentKey, store]);

  /**
   * render
   */
  const render = useCallback(
    (
      renderSuccess?: RenderSuccess<Data, Error>,
      renderIdle?: RenderIdle<Data, Error>,
      renderLoading?: RenderLoading<Data, Error>,
      renderError?: RenderError<Data, Error>,
    ) => {
      switch (status) {
        case Status.Idle: {
          return renderIdle?.(previousDataRef.current, previousErrorRef.current);
        }
        case Status.Loading: {
          return renderLoading?.(previousDataRef.current, previousErrorRef.current);
        }
        case Status.Error: {
          if (currentErrorRef.current === undefined) {
            // eslint-disable-next-line no-console
            console.warn("No error found");
            return null;
          }
          return renderError?.(
            currentErrorRef.current,
            previousDataRef.current,
            previousErrorRef.current,
          );
        }
        case Status.Success: {
          if (currentDataRef.current === undefined) {
            // eslint-disable-next-line no-console
            console.warn("No data found");
            return null;
          }
          return renderSuccess?.(
            currentDataRef.current,
            previousDataRef.current,
            previousErrorRef.current,
          );
        }
        default: {
          // eslint-disable-next-line no-console
          console.warn(`Unknown status(${status})`);
          return null;
        }
      }
    },
    [status],
  );

  /**
   * manipulation
   * [!] These features are for the third party library.
   */
  const manipulation = useMemo(() => {
    return {
      setStatus: (value: Status) => {
        store.set(currentKey, { status: value });
      },
      setPreviousDataWithoutStatus: (data?: Data) => {
        store.set(
          currentKey,
          {
            previousData: data,
          },
          true,
        );
      },
      setPreviousErrorWithoutStatus: (error?: Error) => {
        store.set(
          currentKey,
          {
            previousError: error,
          },
          true,
        );
      },
      setCurrentDataWithoutStatus: (data?: Data) => {
        store.set(
          currentKey,
          {
            currentData: data,
          },
          true,
        );
      },
      setCurrentErrorWithoutStatus: (error?: Error) => {
        store.set(
          currentKey,
          {
            currentError: error,
          },
          true,
        );
      },
    };
  }, [currentKey, store]);

  return [
    render,
    handleData,
    resetData,
    status,
    currentDataRef.current,
    currentErrorRef.current,
    previousDataRef.current,
    previousErrorRef.current,
    manipulation,
  ] as const;
};

export default useRenderState;
