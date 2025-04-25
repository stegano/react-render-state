import { Status } from "./use-render-state.interface";
/**
 * useRenderStateManagement
 */
declare const useRenderStateManagement: <Data, Error>(initialData?: Data, initialError?: Error, key?: string) => readonly [import("./use-render-state.interface").Render<Data, Error>, (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => Promise<Data>, () => void, Status, Data | undefined, Error | undefined, Data | undefined, Error | undefined, (newStateOrFn: import("./use-render-state.interface").State<Data, Error> | ((prev: import("./use-render-state.interface").State<Data, Error>) => import("./use-render-state.interface").State<Data, Error>)) => void, string | undefined];
export default useRenderStateManagement;
