# APIs
## useRenderState
```ts
const [render, handleData, resetData, state] = useRenderState<any>(
  { default: "<Default Data>" }, 
  "SharedKey"
);
...
```
* Arguments
  
  * `options`

    * `default`

      * Sets the default value for the data. If this value is set, the component will immediately render with the default data without needing to call `handleData`.

  * `key`

    * Key used for sharing data. When calling the `useRenderState` hook function with the same key, it shares data and processing state
  

* Returns

  * `render`
    ```tsx
    ...
    render(
      <div>Success</div>, 
      <div>Idle</div>, 
      <div>Loading...</div>, 
      <div>Error</div>
    );
    // Or using callback functions
    render(
      (data) => <div>Success {data}</div>, 
      (previousData) => <div>Idle {previousData}</div>, 
      (data?: Promise<any>, previousData) => <div>Loading... {previousData}</div>, 
      (error, previousData?: any) => <div>Error {error.message}, {previousData}</div>
    );
    ```

    Function to render the screen based on data processing state. It renders components based on the data processing state. If no renderer is set, nothing will be rendered(=return value is `null`).

    > Refer to `handleData` and `resetData` for data processing details.

      * When data processing is completed

      * When data is being processed

      * When waiting for data processing (initial state where data is not yet set)

      * When an error occurs during data processing

  
  * `handleData`
    ```tsx
    ...
    try {  
      const userList = handleData(async () => {
         // [!] Do not include logic other than data processing logic in the `handleData` function to make it easier to test.
        return await axios.get("/api/users");
      }, "executorId");
       // You can also handle the next logic using the processed data.
      console.log(userList);
    } catch(e) {
       // Additional handling can be done when data processing fails.
      console.error(userList);
      alert("Something went wrong");
    }
    ```
    
    Function to process data. Asynchronous or synchronous functions can be passed as callbacks. The render function renders components based on the processing state of the `handleData` function.

    > To make it easier to test, do not include logic other than data processing logic in the handleData function (e.g., displaying error dialogs, processing next logic, etc.). You can also process it with dummy data without directly executing the handleData logic in tools like Storybook. This is covered in the RenderStateProvider section.
  
  * Arguments

      * `previousData`

        * The value of data previously processed successfully. If no data was processed successfully previously, it is undefined.
    
    * Returns

      * The data value to be returned. This data value is passed as an argument to the `render` function.
  
  * `resetData`
    ```tsx
    ...
    useEffect(() => {
      ...
      return () => {
        // Resets the data when the component unmounts.
        handleReset();
      }
    }, [handleReset]);
    ```

    Function to remove the set data and revert to the initial state.


  * `state`
    
    Object containing the state information of the `renderStateHook` function.

    * `status`
    
      * The data processing status.
    
    * `error`
    
      * The error object set when an error occurs. If no error occurred, it is `undefined`.
    
    * `promise`
    
      * The Promise object being processed during asynchronous data processing. If there is no ongoing asynchronous task, it is `undefined`.
    
    * `data`
    
      * The data value set when data processing is successful. If data has not been processed yet, it is `undefined`.
    
    * `previousData`
    
      * The value of data processed successfully previously. If no data was processed successfully previously, it is `undefined`.


## RenderStateProvider
```tsx
...
return (
    <RenderStateProvider store={store} dataHandlerExecutorInterceptorList={[
      (previousExecutorData, dataHandlerExecutor, executorId) => {
        if(executorId === "something") {
          return "Hello";
        }
        return dataHandlerExecutor();
      }
    ]}>
      {children}
    </RenderStateProvider>
  );
```

* `store`

  > Attribute to set the storage space where data is stored. Store settings are covered in the `Store` section below.

* `dataHandlerExecutorInterceptorList`

  Attribute to intercept and transform the behavior of the `handleData` function returned by the `useRenderState` hook. It allows identification and processing based on the executorId. It can accept an array of `dataHandlerExecutorInterceptor` functions, and executes the provided functions sequentially.

  * Arguments
    
    * previousExecutorData
      
      * The value returned by the previous dataHandlerExecutorInterceptor. If there was no previously processed return value, it is `undefined`.
    
    * dataHandlerExecutor
      
      * The data processing implementation function, defined by the `handleData` function returned from `useRenderState`, can execute the actual code values defined in the code or ignore them.
    
    * executorId
      
      * executorId for identifying the handleData function call. This value can be `undefined`.
  
  * Returns
    
    * The return value is passed to the results of the `handleData` and `render` function of the `useRenderState` hook.


### Store

```tsx
...
const store = useMemo(() => {
  return Store.createStore({ debug: true });
}, []);
```

The space where `useRenderState` hook data is stored. If the store object is not directly created and set, it is automatically created and used internally.

> If you want to change the option settings, create the Store directly and set it through `RenderStateProvider`.

#### createStore


* Arguments

* `options`

  * `debug`

    * Displays state information via `console.log` every time data is changed in the store using the `useRenderState` hook.

* returns
  
  * Returns the configured `Store` object.