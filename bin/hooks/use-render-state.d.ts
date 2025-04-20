import { Status, RenderIdle, RenderSuccess, RenderLoading, RenderError } from "./use-render-state.interface";
/**
 * useRenderState
 */
declare const useRenderState: <Data, Error>(initialData?: Data, initialError?: Error, key?: string) => readonly [(renderSuccess?: RenderSuccess<Data, Error>, renderIdle?: RenderIdle<Data, Error>, renderLoading?: RenderLoading<Data, Error>, renderError?: RenderError<Data, Error>) => import("react").ReactNode, (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => Promise<void>, () => void, Status, Data | undefined, Error | undefined, Data | undefined, Error | undefined, {
    setStatus: (value: Status) => void;
    setPreviousDataWithoutStatus: (data?: Data) => void;
    setPreviousErrorWithoutStatus: (error?: Error) => void;
    setCurrentDataWithoutStatus: (data?: Data) => void;
    setCurrentErrorWithoutStatus: (error?: Error) => void;
}];
export default useRenderState;
