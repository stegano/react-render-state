import ReactTestRender from "react-test-renderer";
import { useCallback, useEffect } from "react";
import useRenderState from "./use-render-state";
import { Status } from "./use-render-state.interface";
import { RenderStateProvider } from "../providers";
import { createStore } from "../store";

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

  it("should process data correctly", async () => {
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
      await delay(100 * 2);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Success(Aaa)");
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
            onClick={async () => {
              await handleDataReset();
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
    });

    await ReactTestRender.act(async () => {
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Success(Aaa)");
      await state2.props.onClick();
    });

    await ReactTestRender.act(async () => {
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
              onClick={async () => {
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
    });
    await ReactTestRender.act(async () => {
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

  it("should manipulate data correctly", async () => {
    const TestComponent = () => {
      const [render, , , , , , , , manipulate] = useRenderState<string, Error>();

      useEffect(() => {
        manipulate?.setCurrentDataWithoutStatus("new-data");
        manipulate?.setStatus(Status.Success);
      }, [manipulate]);

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
      await delay(100);
      const state2 = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(state2.children?.join("")).toEqual("Success(new-data)");
    });
  });

  it("should check rendering for each status", async () => {
    const TestComponent = () => {
      const [render, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "test-data";
        });
      }, [handleData]);

      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const component = ReactTestRender.create(<TestComponent />);

    const idleState = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
    expect(idleState.children?.join("")).toBe("Idle");

    await ReactTestRender.act(async () => {
      await delay(200);
      const successState = component.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(successState.children?.join("")).toBe("Success(test-data)");
    });

    const TestErrorComponent = () => {
      const [render, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          throw new Error("test-error");
        }).catch(() => {});
      }, [handleData]);

      return render(
        (data) => <p>Success({data})</p>,
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        (error) => <p>Error({error.message})</p>,
      );
    };

    const errorComponent = ReactTestRender.create(<TestErrorComponent />);

    await ReactTestRender.act(async () => {
      await delay(100);
      const errorState = errorComponent.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(errorState.children?.join("")).toBe("Error(test-error)");
    });

    component.unmount();
    errorComponent.unmount();
  });
});

describe("useRenderState with state management", () => {
  it("should share data between components with same key", async () => {
    const TestComponentA = () => {
      const [render, handleData] = useRenderState<string, Error>(undefined, undefined, "s1");
      return render(
        (data, prevData) => {
          return (
            <button
              type="button"
              onClick={async () => {
                await handleData(async () => {
                  await delay(100);
                  return "Bbb";
                });
              }}
            >
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => (
          <button
            type="button"
            onClick={async () => {
              await handleData(async () => {
                await delay(100);
                return "Aaa";
              });
            }}
          >
            Idle
          </button>
        ),
        () => <p>Loading</p>,
        () => <p>Error</p>,
      );
    };

    const TestComponentB = () => {
      const [render] = useRenderState<string, Error>(undefined, undefined, "s1");
      return render(
        (data, prevData) => {
          return (
            <button type="button">
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        () => <p>Error</p>,
      );
    };

    const componentA = ReactTestRender.create(<TestComponentA />);
    const componentB = ReactTestRender.create(<TestComponentB />);

    await ReactTestRender.act(async () => {
      const componentAState = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBState = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAState.children?.join("")).toEqual("Idle");
      expect(componentBState.children?.join("")).toEqual("Idle");

      await componentAState.props.onClick();

      const componentAstate2 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate2 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate2.children?.join("")).toEqual("Success(Aaa)");
      expect(componentBstate2.children?.join("")).toEqual("Success(Aaa)");

      await componentAstate2.props.onClick();

      const componentAstate3 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate3 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate3.children?.join("")).toEqual("Success(Bbb, Aaa)");
      expect(componentBstate3.children?.join("")).toEqual("Success(Bbb, Aaa)");

      const componentAstate4 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate4 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate4.children?.join("")).toEqual("Success(Bbb, Aaa)");
      expect(componentBstate4.children?.join("")).toEqual("Success(Bbb, Aaa)");

      componentA.unmount();
      componentB.unmount();
    });
  });

  it("should share error state between components with same key", async () => {
    const TestComponentA = () => {
      const [render, handleData] = useRenderState<string, Error>(
        undefined,
        undefined,
        "share-error",
      );
      useEffect(() => {
        setTimeout(() => {
          handleData(async () => {
            return "Aaa";
          });
        }, 10);
      }, [handleData]);
      return render(
        (data, prevData) => {
          return (
            <button
              type="button"
              onClick={async () => {
                await handleData(async () => {
                  throw new Error("Error!");
                }).catch(() => {});
              }}
            >
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        () => <p>Error</p>,
      );
    };

    const TestComponentB = () => {
      const [render] = useRenderState<string, Error>(undefined, undefined, "share-error");
      return render(
        (data, prevData) => {
          return (
            <button type="button">
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        () => <p>Error</p>,
      );
    };

    const componentA = ReactTestRender.create(<TestComponentA />);
    const componentB = ReactTestRender.create(<TestComponentB />);
    await ReactTestRender.act(async () => {
      const componentAState = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBState = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAState.children?.join("")).toEqual("Idle");
      expect(componentBState.children?.join("")).toEqual("Idle");
      await delay(100);
      const componentAstate2 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate2 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate2.children?.join("")).toEqual("Success(Aaa)");
      expect(componentBstate2.children?.join("")).toEqual("Success(Aaa)");
      await componentAstate2.props.onClick();
      await delay(100 * 2);
      const componentAstate3 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate3 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate3.children?.join("")).toEqual("Error");
      expect(componentBstate3.children?.join("")).toEqual("Error");
      componentA.unmount();
      componentB.unmount();
    });
  });

  it("should share data between components with custom store", async () => {
    const TestComponentA = () => {
      const [render, handleData] = useRenderState<string, Error>(undefined, undefined, "s1");
      useEffect(() => {
        async function executor() {
          await delay(10);
          handleData(async () => {
            await delay(100);
            return "Aaa";
          });
        }
        executor();
      }, [handleData]);
      return render(
        (data, prevData) => {
          return (
            <button
              type="button"
              onClick={async () => {
                await handleData(async () => {
                  await delay(100);
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
        () => <p>Error</p>,
      );
    };

    const TestComponentB = () => {
      const [render] = useRenderState<string, Error>(undefined, undefined, "s1");
      return render(
        (data, prevData) => {
          return (
            <button type="button">
              Success({data}
              {prevData ? `, ${prevData}` : ""})
            </button>
          );
        },
        () => <p>Idle</p>,
        () => <p>Loading</p>,
        () => <p>Error</p>,
      );
    };

    const customStore = createStore();
    const componentA = ReactTestRender.create(
      <RenderStateProvider store={customStore}>
        <TestComponentA />
      </RenderStateProvider>,
    );
    const componentB = ReactTestRender.create(
      <RenderStateProvider store={customStore}>
        <TestComponentB />
      </RenderStateProvider>,
    );

    await ReactTestRender.act(async () => {
      const componentAState = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBState = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAState.children?.join("")).toEqual("Idle");
      expect(componentBState.children?.join("")).toEqual("Idle");
      await delay(100 * 2);
      const componentAstate2 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate2 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate2.children?.join("")).toEqual("Success(Aaa)");
      expect(componentBstate2.children?.join("")).toEqual("Success(Aaa)");
      await componentAstate2.props.onClick();
      await delay(100 * 2);
      const componentAstate3 = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBstate3 = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAstate3.children?.join("")).toEqual("Success(Bbb, Aaa)");
      expect(componentBstate3.children?.join("")).toEqual("Success(Bbb, Aaa)");
      expect(customStore.getSnapshot()).toEqual({
        s1: { currentData: "Bbb", previousData: "Aaa", status: "Success" },
      });
      componentA.unmount();
      componentB.unmount();
    });
  });

  it("should share initialData between components with same key", async () => {
    const TestComponentA = () => {
      const [render] = useRenderState<string, Error>("Hello", undefined, "s1");
      return render((data, prevData) => {
        return (
          <p>
            Success({data}
            {prevData ? `, ${prevData}` : ""})
          </p>
        );
      });
    };

    const TestComponentB = () => {
      const [render] = useRenderState<string, Error>("Eee", undefined, "s1");
      return render((data, prevData) => {
        return (
          <p>
            Success({data}
            {prevData ? `, ${prevData}` : ""})
          </p>
        );
      });
    };

    const componentA = ReactTestRender.create(<TestComponentA />);
    const componentB = ReactTestRender.create(<TestComponentB />);

    await ReactTestRender.act(async () => {
      const componentAState = componentA.toJSON() as ReactTestRender.ReactTestRendererJSON;
      const componentBState = componentB.toJSON() as ReactTestRender.ReactTestRendererJSON;
      expect(componentAState.children?.join("")).toEqual("Success(Hello)");
      expect(componentBState.children?.join("")).toEqual("Success(Hello)");
    });

    componentA.unmount();
    componentB.unmount();
  });
});
