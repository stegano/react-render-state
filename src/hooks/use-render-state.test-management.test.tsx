/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, act, fireEvent, screen } from "@testing-library/react";
import { useEffect } from "react";
import useRenderStateManagement from "./use-render-state-management";
import { Status } from "./use-render-state.interface";

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

describe("useRenderStateManagement", () => {
  it("should initialize with default values", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>();
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

    expect(screen.getByTestId("status").textContent).toBe("Idle");
    unmount();
  });

  it("should process data correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "Aaa";
        });
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

    expect(screen.getByTestId("status").textContent).toBe("Loading");

    await act(async () => {
      await delay(100 * 2);
    });

    expect(screen.getByTestId("status").textContent).toBe("Aaa");
    unmount();
  });

  it("should handle errors correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>();
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
      const [renderComponent, handleData, handleDataReset] = useRenderStateManagement<
        string,
        Error
      >();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return renderComponent(
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
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
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
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>();
      useEffect(() => {
        handleData(async () => {
          return "Aaa";
        });
      }, [handleData]);
      return renderComponent(
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
      const [renderComponent] = useRenderStateManagement<string, Error>(
        "initialData",
        new Error("initialError"),
      );
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

    expect(screen.getByTestId("status").textContent).toBe("Success(initialData)");
    unmount();
  });

  it("should handle initial error state correctly", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        undefined,
        new Error("initialError"),
      );
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
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>(
        "initialData",
        new Error("initialError"),
      );

      useEffect(() => {
        handleData(async () => {
          return "newData";
        });
      }, [handleData]);

      return renderComponent(
        (data, prevData) => (
          <p data-testid="status">
            Success({data}, Prev: {prevData})
          </p>
        ),
        () => <p data-testid="status">Idle</p>,
        () => <p data-testid="status">Loading</p>,
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
      const [renderComponent] = useRenderStateManagement<string, Error>(
        "sync-data",
        new Error("syncError"),
      );
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

    expect(screen.getByTestId("status").textContent).toBe("Success(sync-data)");
    unmount();
  });

  it("should set initial error state synchronously", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        undefined,
        new Error("syncError"),
      );
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

    expect(screen.getByTestId("status").textContent).toBe("Error(syncError)");
    unmount();
  });

  it("should set initial idle state synchronously", async () => {
    const TestComponent = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>();
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

    expect(screen.getByTestId("status").textContent).toBe("Idle");
    unmount();
  });

  it("should manipulate data correctly", async () => {
    const TestComponent = () => {
      const [renderComponent, , , , , , , , manipulate] = useRenderStateManagement<string, Error>();

      useEffect(() => {
        manipulate((prev) => ({
          ...prev,
          currentData: "newData",
          status: Status.Success,
        }));
      }, [manipulate]);

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

    expect(screen.getByTestId("status").textContent).toBe("Success(newData)");
    unmount();
  });

  it("should check rendering for each status", async () => {
    const TestComponent = () => {
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>();

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "testData";
        });
      }, [handleData]);

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

    expect(screen.getByTestId("status").textContent).toBe("Loading");

    await act(async () => {
      await delay(200);
    });

    expect(screen.getByTestId("status").textContent).toBe("Success(testData)");

    const TestErrorComponent = () => {
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>();

      useEffect(() => {
        handleData(async () => {
          throw new Error("testError");
        }).catch(() => {});
      }, [handleData]);

      return renderComponent(
        (data) => <p data-testid="errorStatus">Success({data})</p>,
        () => <p data-testid="errorStatus">Idle</p>,
        () => <p data-testid="errorStatus">Loading</p>,
        (error) => <p data-testid="errorStatus">Error({error.message})</p>,
      );
    };

    const { unmount: unmountError } = await act(async () => {
      return render(<TestErrorComponent />);
    });

    await act(async () => {
      await delay(100);
    });

    expect(screen.getByTestId("errorStatus").textContent).toBe("Error(testError)");
    unmountError();
    unmount();
  });
});

describe("useRenderStateManagement data sharing between components", () => {
  it("should share initial data between components", async () => {
    const TestComponentA = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        "initialData",
        undefined,
        "sharing1",
      );
      return renderComponent(
        (data) => <p data-testid="statusA">Success({data})</p>,
        () => <p data-testid="statusA">Idle</p>,
        () => <p data-testid="statusA">Loading</p>,
        (error) => <p data-testid="statusA">Error({error.message})</p>,
      );
    };

    const TestComponentB = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        "initialData(=The initial data shouldn't be changed)",
        undefined,
        "sharing1",
      );
      return renderComponent(
        (data) => <p data-testid="statusB">Success({data})</p>,
        () => <p data-testid="statusB">Idle</p>,
        () => <p data-testid="statusB">Loading</p>,
        (error) => <p data-testid="statusB">Error({error.message})</p>,
      );
    };

    const { unmount: unmountA } = await act(async () => {
      return render(<TestComponentA />);
    });

    const { unmount: unmountB } = await act(async () => {
      return render(<TestComponentB />);
    });

    expect(screen.getByTestId("statusA").textContent).toBe("Success(initialData)");
    expect(screen.getByTestId("statusB").textContent).toBe("Success(initialData)");
    unmountA();
    unmountB();
  });

  it("should share initial error between components", async () => {
    const TestComponentA = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        undefined,
        new Error("initialError"),
        "sharing2",
      );
      return renderComponent(
        (data) => <p data-testid="statusA">Success({data})</p>,
        () => <p data-testid="statusA">Idle</p>,
        () => <p data-testid="statusA">Loading</p>,
        (error) => <p data-testid="statusA">Error({error.message})</p>,
      );
    };

    const TestComponentB = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        undefined,
        new Error("initialError(=The initial error shouldn't be changed)"),
        "sharing2",
      );
      return renderComponent(
        (data) => <p data-testid="statusB">Success({data})</p>,
        () => <p data-testid="statusB">Idle</p>,
        () => <p data-testid="statusB">Loading</p>,
        (error) => <p data-testid="statusB">Error({error.message})</p>,
      );
    };

    const { unmount: unmountA } = await act(async () => {
      return render(<TestComponentA />);
    });

    const { unmount: unmountB } = await act(async () => {
      return render(<TestComponentB />);
    });

    expect(screen.getByTestId("statusA").textContent).toBe("Error(initialError)");
    expect(screen.getByTestId("statusB").textContent).toBe("Error(initialError)");
    unmountA();
    unmountB();
  });

  it("should share data and status between components", async () => {
    const TestComponentA = () => {
      const [renderComponent, handleData] = useRenderStateManagement<string, Error>(
        undefined,
        undefined,
        "sharing3",
      );

      useEffect(() => {
        handleData(async () => {
          await delay(100);
          return "testData";
        });
      }, [handleData]);

      return renderComponent(
        (data) => <p data-testid="statusA">Success({data})</p>,
        () => <p data-testid="statusA">Idle</p>,
        () => <p data-testid="statusA">Loading</p>,
        (error) => <p data-testid="statusA">Error({error.message})</p>,
      );
    };

    const TestComponentB = () => {
      const [renderComponent] = useRenderStateManagement<string, Error>(
        undefined,
        undefined,
        "sharing3",
      );
      return renderComponent(
        (data) => <p data-testid="statusB">Success({data})</p>,
        () => <p data-testid="statusB">Idle</p>,
        () => <p data-testid="statusB">Loading</p>,
        (error) => <p data-testid="statusB">Error({error.message})</p>,
      );
    };

    const { unmount: unmountA } = await act(async () => {
      return render(<TestComponentA />);
    });

    const { unmount: unmountB } = await act(async () => {
      return render(<TestComponentB />);
    });

    expect(screen.getByTestId("statusA").textContent).toBe("Loading");
    expect(screen.getByTestId("statusB").textContent).toBe("Loading");

    await act(async () => {
      await delay(300);
    });

    expect(screen.getByTestId("statusA").textContent).toBe("Success(testData)");
    expect(screen.getByTestId("statusB").textContent).toBe("Success(testData)");

    unmountA();
    unmountB();
  });
});
