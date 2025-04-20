import { PropsWithChildren } from "react";
import { IStore } from "../store";
/**
 * Context
 */
export interface Context {
    /**
     * getStore
     */
    getStore: () => IStore.Store;
}
/**
 * Props
 */
export interface Props extends PropsWithChildren {
    /**
     * store
     */
    store?: IStore.Store;
}
