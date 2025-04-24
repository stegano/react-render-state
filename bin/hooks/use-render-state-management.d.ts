import { Status } from "./use-render-state.interface";
/**
 * useRenderStateManagement
 */
declare const useRenderStateManagement: <Data, Error>(initialData?: Data, initialError?: Error, key?: string) => readonly [(renderSuccess?: import("./use-render-state.interface").RenderSuccess<Data, Error> | undefined, renderIdle?: import("./use-render-state.interface").RenderIdle<Data, Error> | undefined, renderLoading?: import("./use-render-state.interface").RenderLoading<Data, Error> | undefined, renderError?: import("./use-render-state.interface").RenderError<Data, Error> | undefined) => import("react").ReactNode, (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => Promise<Data>, () => void, Status, Data | undefined, Error | undefined, Data | undefined, Error | undefined, (newStateOrFn: import("./use-render-state.interface").State<Data, Error> | ((prev: import("./use-render-state.interface").State<Data, Error>) => import("./use-render-state.interface").State<Data, Error>)) => void, string | undefined];
export default useRenderStateManagement;
