import { createStore } from "./store";
import { Status } from "../hooks/use-render-state.interface";

describe("store", () => {
  it("should create the store", () => {
    const store = createStore();
    expect(store).toBeDefined();
  });
  it("should have the correct initial state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Success,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    expect(store.getSnapshot()).toEqual({
      data: {
        status: Status.Success,
        currentData: ["a", "b", "c"],
        previousData: undefined,
        currentError: undefined,
        previousError: undefined,
        initialData: ["a", "b", "c"],
        initialError: undefined,
      },
    });
  });
  it("should update the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Error,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    store.set("data", {
      status: Status.Success,
      currentData: ["d", "e", "f"],
      previousData: ["a", "b", "c"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["a", "b", "c"],
      initialError: undefined,
    });
    expect(store.getSnapshot()).toEqual({
      data: {
        status: Status.Success,
        currentData: ["d", "e", "f"],
        previousData: ["a", "b", "c"],
        currentError: undefined,
        previousError: undefined,
        initialData: ["a", "b", "c"],
        initialError: undefined,
      },
    });
  });
  it("should subscribe to updates", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Success,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    const listener = jest.fn();
    store.subscribe(listener);
    store.set("data", {
      status: Status.Success,
      currentData: ["d", "e", "f"],
      previousData: ["a", "b", "c"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["a", "b", "c"],
      initialError: undefined,
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("should unsubscribe from updates", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Success,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set("data", {
      status: Status.Success,
      currentData: ["d", "e", "f"],
      previousData: ["a", "b", "c"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["a", "b", "c"],
      initialError: undefined,
    });
    expect(listener).toHaveBeenCalledTimes(0);
  });
  it("should get the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Success,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    expect(store.get("data")).toEqual({
      status: Status.Success,
      currentData: ["a", "b", "c"],
      previousData: undefined,
      currentError: undefined,
      previousError: undefined,
      initialData: ["a", "b", "c"],
      initialError: undefined,
    });
  });
  it("should silent set the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          status: Status.Success,
          currentData: ["a", "b", "c"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["a", "b", "c"],
          initialError: undefined,
        },
      },
    });
    const dummyFn = jest.fn();
    store.subscribe(dummyFn);
    store.set(
      "data",
      {
        status: Status.Success,
        currentData: ["d", "e", "f"],
      },
      true,
    );
    expect(dummyFn).toHaveBeenCalledTimes(0);
    expect(store.getSnapshot()).toEqual({
      data: {
        status: Status.Success,
        currentData: ["d", "e", "f"],
        previousData: undefined,
        currentError: undefined,
        previousError: undefined,
        initialData: ["a", "b", "c"],
        initialError: undefined,
      },
    });
  });
});
