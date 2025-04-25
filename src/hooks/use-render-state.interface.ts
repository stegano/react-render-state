import { ReactNode } from "react";

/**
 * State
 */
export interface State<Data, Error> {
  /**
   * status
   */
  status: Status;
  /**
   * currentData
   */
  currentData?: Data;
  /**
   * previousData
   */
  previousData?: Data;
  /**
   * currentError
   */
  currentError?: Error;
  /**
   * previousError
   */
  previousError?: Error;
}

/**
 * Status
 */
export enum Status {
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
  Success = "Success",
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

/**
 * Render
 */
export interface Render<Data, Error> {
  (renderSuccess?: RenderSuccess<Data, Error>): ReactNode;
  (
    renderIdle?: RenderIdle<Data, Error>,
    renderLoading?: RenderLoading<Data, Error>,
    renderSuccess?: RenderSuccess<Data, Error>,
    renderError?: RenderError<Data, Error>,
  ): ReactNode;
}
