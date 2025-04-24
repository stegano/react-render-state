import { Status, RenderIdle, RenderSuccess, RenderLoading, RenderError, State } from "./use-render-state.interface";
/**
 * useRenderState
 */
declare const useRenderState: <Data, Error>(initialData?: Data, initialError?: Error) => readonly [(renderSuccess?: RenderSuccess<Data, Error>, renderIdle?: RenderIdle<Data, Error>, renderLoading?: RenderLoading<Data, Error>, renderError?: RenderError<Data, Error>) => import("react").ReactNode, (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => Promise<Data>, () => void, Status, Data | undefined, Error | undefined, Data | undefined, Error | undefined, (newStateOrFn: State<Data, Error> | ((prev: State<Data, Error>) => State<Data, Error>)) => void, string];
export default useRenderState;
