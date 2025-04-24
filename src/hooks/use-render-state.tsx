import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  Status,
  RenderIdle,
  RenderSuccess,
  RenderLoading,
  RenderError,
  State,
} from "./use-render-state.interface";

/**
 * useRenderState
 */
const useRenderState = <Data, Error>(initialData?: Data, initialError?: Error) => {
  const cId = useId();
  const id = useMemo(() => `${cId}_renderState`, [cId]);
  const previousDataRef = useRef<Data>(undefined);
  const previousErrorRef = useRef<Error>(undefined);
  const currentDataRef = useRef<Data | undefined>(initialData);
  const currentErrorRef = useRef<Error | undefined>(initialError);
  const [status, setStatus] = useState<Status>(() => {
    if (initialData !== undefined) {
      return Status.Success;
    }
    if (initialError !== undefined) {
      return Status.Error;
    }
    return Status.Idle;
  });

  /**
   * manipulation
   * [!] These features are for the third party library.
   */
  const manipulation = useCallback(
    (newStateOrFn: State<Data, Error> | ((prev: State<Data, Error>) => State<Data, Error>)) => {
      if (typeof newStateOrFn === "function") {
        const callbackFn = newStateOrFn;
        setStatus((prevState) => {
          const nextState = callbackFn({
            previousData: previousDataRef.current,
            previousError: previousErrorRef.current,
            currentData: currentDataRef.current,
            currentError: currentErrorRef.current,
            status: prevState,
          });
          previousDataRef.current = nextState.previousData;
          previousErrorRef.current = nextState.previousError;
          currentDataRef.current = nextState.currentData;
          currentErrorRef.current = nextState.currentError;
          return nextState.status;
        });
      } else {
        const nextState = newStateOrFn;
        previousDataRef.current = nextState.previousData;
        previousErrorRef.current = nextState.previousError;
        currentDataRef.current = nextState.currentData;
        currentErrorRef.current = nextState.currentError;
        setStatus(nextState.status);
      }
    },
    [],
  );

  /**
   * handleData
   */
  const handleData = useCallback(
    async (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => {
      try {
        previousDataRef.current = currentDataRef.current;
        previousErrorRef.current = currentErrorRef.current;
        currentDataRef.current = undefined;
        currentErrorRef.current = undefined;
        setStatus(Status.Loading);
        const data = await processFn(previousDataRef.current, previousErrorRef.current);
        currentDataRef.current = data;
        setStatus(Status.Success);
        return data;
      } catch (error) {
        currentErrorRef.current = error as Error;
        setStatus(Status.Error);
        throw error;
      }
    },
    [],
  );

  /**
   * resetData
   */
  const resetData = useCallback(() => {
    previousDataRef.current = currentDataRef.current;
    previousErrorRef.current = currentErrorRef.current;
    currentDataRef.current = undefined;
    currentErrorRef.current = undefined;
    setStatus(Status.Idle);
  }, []);

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
    id,
  ] as const;
};

export default useRenderState;
