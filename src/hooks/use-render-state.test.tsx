/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, act, fireEvent, screen } from "@testing-library/react";
import { useEffect } from "react";
import useRenderState from "./use-render-state";
import { Status } from "./use-render-state.interface";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

describe("useRenderState", () => {
  it("should initialize with default values", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>();
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">{data}</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Idle");
    unmount();
  });

  it("should process data correctly with single argument renderSuccess", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "Aaa";
        });
      }, [handleData]);

      return renderComponent((data) => <p data-testid="status">{data}</p>);
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(200);
    });

    expect(screen.getByTestId("status").textContent).toBe("Aaa");
    unmount();
  });

  it("should process data correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "Aaa";
        });
      }, [handleData]);

      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">{data}</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Loading");

    await act(async () => {
      await delay(100 * 2);
    });

    expect(screen.getByTestId("status").textContent).toBe("Aaa");
    unmount();
  });

  it("should handle errors correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          throw new Error("Error");
        }).catch(() => {});
      }, [handleData]);
      return renderComponent(
        (data) => <p data-testid="status">{data}</p>,
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(100 * 2);
    });

    expect(screen.getByTestId("status").textContent).toBe("Error(Error)");
    unmount();
  });

  it("should reset state correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData, handleDataReset] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
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
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(100);
    });

    const successButton = screen.getByRole("button");
    expect(successButton.textContent).toBe("Success(Aaa)");

    await act(async () => {
      fireEvent.click(successButton!);
    });

    expect(screen.getByTestId("status").textContent).toBe("Idle");
    unmount();
  });

  it("should maintain previous state during transitions", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
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
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(100 * 2);
    });

    const successButton = screen.getByRole("button");
    expect(successButton.textContent).toBe("Success(Aaa)");

    await act(async () => {
      fireEvent.click(successButton!);
      await delay(100 * 2);
    });

    expect(screen.getByRole("button").textContent).toBe("Success(Bbb, Aaa)");
    unmount();
  });

  it("should handle initial data and error correctly", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>(
        "initialData",
        new Error("initialError"),
      );
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(initialData)");
    unmount();
  });

  it("should handle initial error state correctly", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>(undefined, new Error("initialError"));
      return renderComponent(
        (data) => <p data-testid="status">Success({data})</p>,
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Error(initialError)");
    unmount();
  });

  it("should maintain initial data and error during state transitions", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>(
        "initialData",
        new Error("initialError"),
      );

      useEffect(() => {
        handleData(async () => {
          return "newData";
        });
      }, [handleData]);

      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data, prevData) => (
          <p data-testid="status">
            Success({data}, Prev: {prevData})
          </p>
        ),
        (error, prevData, prevError) => (
          <p data-testid="status">
            Error({error.message}, Prev: {prevData}, PrevError: {prevError?.message})
          </p>
        ),
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(newData, Prev: initialData)");
    unmount();
  });

  it("should set initial state synchronously", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>("sync-data", new Error("sync-error"));
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(sync-data)");
    unmount();
  });

  it("should set initial error state synchronously", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>(undefined, new Error("sync-error"));
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Error(sync-error)");
    unmount();
  });

  it("should set initial idle state synchronously", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<string, Error>();
      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Idle");
    unmount();
  });

  it("should manipulate data correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, , , , , , , , manipulate] = useRenderState<string, Error>();

      useEffect(() => {
        manipulate((prev) => {
          return {
            ...prev,
            currentData: "newData",
            status: Status.Success,
          };
        });
      }, [manipulate]);

      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(newData)");
    unmount();
  });

  it("should check rendering for each status", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "testData";
        });
      }, [handleData]);

      return renderComponent(
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
        (data) => <p data-testid="status">Success({data})</p>,
        (error) => <p data-testid="status">Error({error.message})</p>,
      );
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("Loading");

    await act(async () => {
      await delay(200);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(testData)");

    const TestErrorComponent = () => {
      const [renderComponent, handleData] = useRenderState<string, Error>();

      useEffect(() => {
        handleData(async () => {
          throw new Error("test-error");
        }).catch(() => {});
      }, [handleData]);

      return renderComponent(
        () => <p data-testid="errorStatus">Idle</p>,
        () => <p data-testid="errorStatus">Loading</p>,
        (data) => <p data-testid="errorStatus">Success({data})</p>,
        (error) => <p data-testid="errorStatus">Error({error.message})</p>,
      );
    };

    const { unmount: unmountError } = await act(async () => {
      return render(<TestErrorComponent />);
    });

    await act(async () => {
      await delay(100);
    });

    expect(screen.getByTestId("errorStatus").textContent).toBe("Error(test-error)");
    unmountError();
    unmount();
  });
});

describe("useRenderState with render options object", () => {
  it("should render idle state with onIdle option", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderState<number, Error>();
      return renderComponent({
        onIdle: () => <div data-testid="status">render idle</div>,
        onLoading: () => <div data-testid="status">render loading</div>,
        onSuccess: (data: number) => <div data-testid="status">render success: {data}</div>,
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      });
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("render idle");
    unmount();
  });

  it("should render loading state with onLoading option", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<number, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return 42;
        });
      }, [handleData]);

      return renderComponent({
        onIdle: () => <div data-testid="status">render idle</div>,
        onLoading: () => <div data-testid="status">render loading</div>,
        onSuccess: (data: number) => <div data-testid="status">render success: {data}</div>,
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      });
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    expect(screen.getByTestId("status").textContent).toBe("render loading");
    unmount();
  });

  it("should render success state with onSuccess option", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<number, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return 42;
        });
      }, [handleData]);

      return renderComponent({
        onIdle: () => <div data-testid="status">render idle</div>,
        onLoading: () => <div data-testid="status">render loading</div>,
        onSuccess: (data: number) => <div data-testid="status">render success: {data}</div>,
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      });
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(200);
    });

    expect(screen.getByTestId("status").textContent).toBe("render success: 42");
    unmount();
  });

  it("should render error state with onError option", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<number, Error>();

      useEffect(() => {
        handleData(async () => {
          throw new Error("Test error");
        }).catch(() => {});
      }, [handleData]);

      return renderComponent({
        onIdle: () => <div data-testid="status">render idle</div>,
        onLoading: () => <div data-testid="status">render loading</div>,
        onSuccess: (data: number) => <div data-testid="status">render success: {data}</div>,
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      });
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    await act(async () => {
      await delay(200);
    });

    expect(screen.getByTestId("status").textContent).toBe("render error Error: Test error");
    unmount();
  });

  it("should handle all state transitions with options object", async () => {
    /* eslint-disable react/no-unstable-nested-components */
    function TestComponent() {
      const [renderComponent, handleData, resetData] = useRenderState<number, Error>();

      const renderOptions = {
        onIdle: () => <div data-testid="status">render idle</div>,
        onLoading: () => <div data-testid="status">render loading</div>,
        onSuccess: (data: number) => (
          <div>
            <div data-testid="status">render success: {data}</div>
            <button type="button" data-testid="reset-btn" onClick={() => resetData()}>
              Reset
            </button>
          </div>
        ),
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      };

      return (
        <div>
          {renderComponent(renderOptions)}
          <button
            type="button"
            data-testid="load-btn"
            onClick={() => {
              handleData(async () => {
                await delay(50);
                return 123;
              });
            }}
          >
            Load Data
          </button>
          <button
            type="button"
            data-testid="error-btn"
            onClick={() => {
              handleData(async () => {
                throw new Error("Triggered error");
              }).catch(() => {});
            }}
          >
            Trigger Error
          </button>
        </div>
      );
    }

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    // Initial idle state
    expect(screen.getByTestId("status").textContent).toBe("render idle");

    // Test loading state
    await act(async () => {
      fireEvent.click(screen.getByTestId("load-btn"));
    });
    expect(screen.getByTestId("status").textContent).toBe("render loading");

    // Test success state
    await act(async () => {
      await delay(100);
    });
    expect(screen.getByTestId("status").textContent).toBe("render success: 123");

    // Test reset to idle
    await act(async () => {
      fireEvent.click(screen.getByTestId("reset-btn"));
    });
    expect(screen.getByTestId("status").textContent).toBe("render idle");

    // Test error state
    await act(async () => {
      fireEvent.click(screen.getByTestId("error-btn"));
      await delay(100);
    });
    expect(screen.getByTestId("status").textContent).toBe("render error Error: Triggered error");

    unmount();
  });

  it("should handle partial options object", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderState<number, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(50);
          return 99;
        });
      }, [handleData]);

      return renderComponent({
        onSuccess: (data: number) => <div data-testid="status">render success: {data}</div>,
        onError: (error: unknown) => <div data-testid="status">render error {String(error)}</div>,
      });
    };

    const { unmount } = await act(async () => {
      return render(<TestComponent />);
    });

    // Should render nothing for loading state since onLoading is not provided
    expect(screen.queryByTestId("status")).toBeNull();

    await act(async () => {
      await delay(100);
    });

    // Should render success state
    expect(screen.getByTestId("status").textContent).toBe("render success: 99");
    unmount();
  });
});
