import { Status, State, Render } from "./use-render-state.interface";
/**
 * useRenderState
 */
declare const useRenderState: <Data, Error>(initialData?: Data, initialError?: Error) => readonly [Render<Data, Error>, (processFn: (prevData?: Data, prevError?: Error) => Promise<Data> | Data) => Promise<Data>, () => void, Status, Data | undefined, Error | undefined, Data | undefined, Error | undefined, (newStateOrFn: State<Data, Error> | ((prev: State<Data, Error>) => State<Data, Error>)) => void, string];
export default useRenderState;
