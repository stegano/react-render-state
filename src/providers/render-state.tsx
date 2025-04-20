import { createContext, useMemo } from "react";
import { Context, Props } from "./render-state.interface";
import { createStore } from "../store";

/**
 * Default store
 */
export const defaultStore = createStore();

/**
 * RenderStateContext
 */
export const RenderStateContext = createContext<Context>({
  getStore: () => {
    return defaultStore;
  },
});

/**
 * RenderStateProvider
 */
function RenderStateProvider({ children, store = defaultStore }: Props) {
  const state = useMemo(
    () => ({
      getStore: () => {
        return store;
      },
    }),
    [store],
  );
  return <RenderStateContext.Provider value={state}>{children}</RenderStateContext.Provider>;
}

export default RenderStateProvider;
