import ReactTestRender from "react-test-renderer";
import { useCallback, useEffect } from "react";
import useRenderState from "./use-render-state";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

describe("useRenderState", () => {
  it("should initialize with default values", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>();
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state.children?.join("")).toEqual("Idle");
      component.unmount();
    });
  });

  it("should handle data processing correctly", async () => {
    const TestComponent = () => {
      const task = useCallback(
        async () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          }),
        [],
      );

      const [render, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await task();
          return "Aaa";
        });
      }, [handleData, task]);

      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state1 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state1.children?.join("")).toEqual("Idle");
      await delay(1);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Loading");
      await delay(100 * 2);
      const state3 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state3.children?.join("")).toEqual("Success(Aaa)");
      component.unmount();
    });
  });

  it("should handle errors correctly", async () => {
    const TestComponent = () => {
      const [render, handleData] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          throw new Error("Error");
        }).catch(() => {});
      }, [handleData]);
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state1 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state1.children?.join("")).toEqual("Idle");
      await delay(100 * 2);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Error(Error)");
      component.unmount();
    });
  });

  it("should reset state correctly", async () => {
    const TestComponent = () => {
      const [render, handleData, handleDataReset] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return render(
        (data) => (
          <button
            type="button"
            onClick={() => {
              handleDataReset();
            }}
          >
            Success({data})
          </button>
        ),
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state1 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state1.children?.join("")).toEqual("Idle");
      await delay(100 * 2);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Success(Aaa)");
      state2.props.onClick();
      await delay(1);
      const state3 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state3.children?.join("")).toEqual("Idle");
      component.unmount();
    });
  });

  it("should maintain previous state during transitions", async () => {
    const TestComponent = () => {
      const [render, handleData] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return render(
        (data, prevData) => {
          return (
            <button
              type="button"
              onClick={() => {
                handleData(async () => {
                  return "Bbb";
                });
              }}
            >
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state1 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state1.children?.join("")).toEqual("Idle");
      await delay(100 * 2);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Success(Aaa)");
      state2.props.onClick();
      await delay(100 * 2);
      const state3 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state3.children?.join("")).toEqual("Success(Bbb, Aaa)");
      component.unmount();
    });
  });

  it("should handle initial data and error correctly", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>("initial-data", new Error("initial-error"));
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state.children?.join("")).toEqual("Success(initial-data)");
      component.unmount();
    });
  });

  it("should handle initial error state correctly", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>(undefined, new Error("initial-error"));
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state.children?.join("")).toEqual("Error(initial-error)");
      component.unmount();
    });
  });

  it("should maintain initial data and error during state transitions", async () => {
    const TestComponent = () => {
      const [render, handleData] = useRenderState<string, Error>(
        "initial-data",
        new Error("initial-error"),
      );

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "new-data";
        });
      }, [handleData]);

      return render(
        (data, prevData) => (
          <p>
            Success({data}, Prev: {prevData})
          </p>
        ),
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error, prevData, prevError) => (
          <p>
            Error({error.message}, Prev: {prevData}, PrevError: {prevError?.message})
          </p>
        ),
      );
    };

    const component = ReactTestRender.create(<TestComponent />);
    await ReactTestRender.act(async () => {
      const state1 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state1.children?.join("")).toEqual("Success(initial-data, Prev: )");
      await delay(100);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Loading");
      await delay(100 * 2);
      const state3 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state3.children?.join("")).toEqual("Success(new-data, Prev: initial-data)");
      component.unmount();
    });
  });

  it("should set initial state synchronously", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>("sync-data", new Error("sync-error"));
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);

    /**
     * It should be Success(sync-data)
     */
    const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
    expect(state.children?.join("")).toEqual("Success(sync-data)");
    component.unmount();
  });

  it("should set initial error state synchronously", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>(undefined, new Error("sync-error"));
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);

    /**
     * It should be Error(sync-error)
     */
    const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
    expect(state.children?.join("")).toEqual("Error(sync-error)");
    component.unmount();
  });

  it("should set initial idle state synchronously", async () => {
    const TestComponent = () => {
      const [render] = useRenderState<string, Error>();
      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);

    /**
     * It should be Idle
     */
    const state = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
    expect(state.children?.join("")).toEqual("Idle");
    component.unmount();
  });
});
