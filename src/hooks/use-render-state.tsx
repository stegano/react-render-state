import { useCallback, useMemo, useRef, useState } from "react";
import {
  Status,
  RenderIdle,
  RenderSuccess,
  RenderLoading,
  RenderError,
} from "./use-render-state.interface";

const useRenderState = <Data, Error>(initialData?: Data, initialError?: Error) => {
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
   * handleData
   */
  const handleData = useCallback(
    async (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => {
      try {
        previousErrorRef.current = currentErrorRef.current;
        currentErrorRef.current = undefined;
        previousDataRef.current = currentDataRef.current;
        currentDataRef.current = undefined;
        setStatus(Status.Loading);
        const data = await processFn(previousDataRef.current, previousErrorRef.current);
        currentDataRef.current = data;
        setStatus(Status.Success);
      } catch (error) {
        currentErrorRef.current = error as Error;
        setStatus(Status.Error);
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
          console.warn("No data found");
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
        setStatus(value);
      },
      setPreviousDataWithoutStatus: (data?: Data) => {
        previousDataRef.current = data;
      },
      setPreviousErrorWithoutStatus: (error?: Error) => {
        previousErrorRef.current = error;
      },
      setCurrentDataWithoutStatus: (data?: Data) => {
        currentDataRef.current = data;
      },
      setCurrentErrorWithoutStatus: (error?: Error) => {
        currentErrorRef.current = error;
      },
    };
  }, []);

  return [
    render,
    handleData,
    resetData,
    status,
    currentDataRef.current,
    currentErrorRef.current,
    manipulation,
  ] as const;
};

export default useRenderState;
