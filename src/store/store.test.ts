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
          latestUpdatedId: "data",
          status: Status.Success,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    expect(store.getSnapshot()).toEqual({
      data: {
        latestUpdatedId: "data",
        status: Status.Success,
        currentData: ["A", "B", "C"],
        previousData: undefined,
        currentError: undefined,
        previousError: undefined,
        initialData: ["A", "B", "C"],
        initialError: undefined,
      },
    });
  });
  it("should update the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          latestUpdatedId: "data",
          status: Status.Error,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    store.set("data", {
      latestUpdatedId: "data",
      status: Status.Success,
      currentData: ["D", "E", "F"],
      previousData: ["A", "B", "C"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["A", "B", "C"],
      initialError: undefined,
    });
    expect(store.getSnapshot()).toEqual({
      data: {
        latestUpdatedId: "data",
        status: Status.Success,
        currentData: ["D", "E", "F"],
        previousData: ["A", "B", "C"],
        currentError: undefined,
        previousError: undefined,
        initialData: ["A", "B", "C"],
        initialError: undefined,
      },
    });
  });
  it("should subscribe to updates", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          latestUpdatedId: "data",
          status: Status.Success,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    const listener = jest.fn();
    store.subscribe(listener);
    store.set("data", {
      latestUpdatedId: "data",
      status: Status.Success,
      currentData: ["D", "E", "F"],
      previousData: ["A", "B", "C"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["A", "B", "C"],
      initialError: undefined,
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("should unsubscribe from updates", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          latestUpdatedId: "data",
          status: Status.Success,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set("data", {
      latestUpdatedId: "data",
      status: Status.Success,
      currentData: ["D", "E", "F"],
      previousData: ["A", "B", "C"],
      currentError: undefined,
      previousError: undefined,
      initialData: ["A", "B", "C"],
      initialError: undefined,
    });
    expect(listener).toHaveBeenCalledTimes(0);
  });
  it("should get the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          latestUpdatedId: "data",
          status: Status.Success,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    expect(store.get("data")).toEqual({
      latestUpdatedId: "data",
      status: Status.Success,
      currentData: ["A", "B", "C"],
      previousData: undefined,
      currentError: undefined,
      previousError: undefined,
      initialData: ["A", "B", "C"],
      initialError: undefined,
    });
  });
  it("should silent set the state", () => {
    const store = createStore({
      initialStoreData: {
        data: {
          latestUpdatedId: "data",
          status: Status.Success,
          currentData: ["A", "B", "C"],
          previousData: undefined,
          currentError: undefined,
          previousError: undefined,
          initialData: ["A", "B", "C"],
          initialError: undefined,
        },
      },
    });
    const dummyFn = jest.fn();
    store.subscribe(dummyFn);
    store.set(
      "data",
      {
        latestUpdatedId: "data",
        status: Status.Success,
        currentData: ["D", "E", "F"],
      },
      true,
      true,
    );
    expect(dummyFn).toHaveBeenCalledTimes(0);
    expect(store.getSnapshot()).toEqual({
      data: {
        latestUpdatedId: "data",
        status: Status.Success,
        currentData: ["D", "E", "F"],
        previousData: undefined,
        currentError: undefined,
        previousError: undefined,
        initialData: ["A", "B", "C"],
        initialError: undefined,
      },
    });
  });
});
