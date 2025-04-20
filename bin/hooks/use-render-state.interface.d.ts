import { ReactNode } from "react";
/**
 * Status
 */
export declare enum Status {
    /**
     * Idle
     */
    Idle = "Idle",
    /**
     * Loading
     */
    Loading = "Loading",
    /**
     * Error
     */
    Error = "Error",
    /**
     * Success
     */
    Success = "Success"
}
/**
 * RenderIdle
 */
export interface RenderIdle<Data, Error> {
    (previousData?: Data, previousError?: Error): ReactNode;
}
/**
 * RenderError
 */
export interface RenderError<Data, Error> {
    (error: Error, previousData?: Data, previousError?: Error): ReactNode;
}
/**
 * RenderLoading
 */
export interface RenderLoading<Data, Error> {
    (previousData?: Data, previousError?: Error): ReactNode;
}
/**
 * RenderSuccess
 */
export interface RenderSuccess<Data, Error> {
    (data: Data, previousData?: Data, previousError?: Error): ReactNode;
}
