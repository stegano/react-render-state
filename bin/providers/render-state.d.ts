import { Context, Props } from "./render-state.interface";
/**
 * Default store
 */
export declare const defaultStore: import("../store/store.interface").Store;
/**
 * RenderStateContext
 */
export declare const RenderStateContext: import("react").Context<Context>;
/**
 * RenderStateProvider
 */
declare function RenderStateProvider({ children, store }: Props): import("react/jsx-runtime").JSX.Element;
export default RenderStateProvider;
