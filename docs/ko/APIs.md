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

      * 데이터 기본값을 설정합니다. 이 값이 설정된 경우 `handleData`를 호출하지 않아도 설정된 기본 값 데이터로 즉시 랜더링 됩니다.

  * `key`

    * 데이터를 공유하기 위한 키 입니다. `useRenderState` 훅 함수를 호출할때 동일한 키를 사용하는 경우 데이터와 처리 상태를 공유합니다.

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
    // 또는 콜백 함수를 사용
    render(
      (data) => <div>Success {data}</div>, 
      (previousData) => <div>Idle {previousData}</div>, 
      (data?: Promise<any>, previousData) => <div>Loading... {previousData}</div>, 
      (error, previousData?: any) => <div>Error {error.message}, {previousData}</div>
    );
    ```

    데이터 처리 상태에 따라 화면을 랜더링 하는 함수입니다. 데이터 처리 상태에 따라 컴포넌트를 랜더링합니다. 랜더러가 설정되지 않은 경우 랜더링 하지 않습니다(null 값을 리턴).
    
    > 데이터 처리 관련 내용은 아래 `handleData`, `resetData`를 참고하세요.

      * 데이터 처리가 완료된 경우

      * 데이터가 처리중인 경우

      * 데이터 처리를 기다리는 경우(데이터가 설정되지 않은 최초 상태)

      * 데이터 처리중 에러가 발생한 경우
  
  * `handleData`
    ```tsx
    ...
    try {  
      const userList = handleData(async () => {
        // [!] 테스트 하기 쉬운 코드를 만들려면 `handleData` 함수 내에서는 데이터 처리 로직외 다른 로직을 포함하지 마세요.
        return await axios.get("/api/users");
      }, "executorId");
      // 처리된 데이터를 이용하여 다음 로직을 처리할 수 도 있습니다.
      console.log(userList);
    } catch(e) {
      // 데이터 처리에 실패했을때 추가적인 처리도 할 수 있습니다.
      console.error(userList);
      alert("Something went wrong");
    }
    ```
    
    데이터를 처리하는 함수입니다. 비동기 또는 동기함수를 콜백으로 전달할 수 있습니다. `render` 함수는 이 함수의 처리 상태에 따라 컴포넌트를 랜더링 합니다. 
    
    > 테스트하기 쉬운 코드를 만들려면 `handleData` 함수 내부에서 데이터 처리로직 외 다른 로직(e.g., 에러 다이얼로그 노출, 다음로직 처리등..)을 포함하지 마세요. 스토리북과 같은 도구에서 `handleData` 로직을 직접 실행하지 않고 더미 데이터로 처리할 수도 있습니다. 이 내용은 `RenderStateProvider` 섹션에서 다룹니다.

    * Arguments

      * `previousData`

        * 이전에 정상적으로 처리된 데이터 값 입니다. 이전에 정상적으로 처리된 데이터가 존재하지 않는다면 undefined 값 입니다
    
    * Returns

      * 반환될 데이터 값 입니다. 이 데이터 값은 `render` 함수의 인자로 전달됩니다.
  
  * `resetData`
    ```tsx
    ...
    useEffect(() => {
      ...
      return () => {
        // 컴포넌트가 언마운트 될때 데이터를 리셋합니다.
        handleReset();
      }
    }, [handleReset]);
    ```
    
    * 설정된 데이터를 제거하고, 초기 상태로 되돌리는 함수입니다.


  * `state`
    
    `renderStateHook` 함수의 상태 정보를 담고있는 객체입니다.
    
    * `status`
    
      * 현재 데이터 처리 상태 입니다.
    
    * `error`
    
      * 에러가 발생한 경우 설정된 에러 객체 입니다. 에러가 발생하지 않았다면 `undefiend` 값 입니다.
    
    * `promise`
    
      * 비동기 데이터 처리시 처리중인 Promise 객체 입니다. 처리중인 비동기 작업이 없다면 `undefined` 값 입니다.
    
    * `data`
    
      * 데이터가 정상적으로 처리된 경우 설정된 데이터 값 입니다. 데이터가 아직 처리되지 않았다면 `undefined` 값 입니다.
    
    * `previousData`
    
      * 이전에 정상적으로 처리된 데이터 값 입니다. 이전에 정상적으로 처리된 데이터가 존재하지 않는다면 `undefined` 값 입니다.


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

  > 데이터가 저장되는 저장소를 설정할 수 있는 속성 입니다. 저장소 관련 설정은 아래 `Store` 섹션에서 다룹니다.

* `dataHandlerExecutorInterceptorList`

  `useRenderState` 훅 함수에서 반환하는 `handleData` 함수 동작을 가로채 변환 할 수 있는 속성 입니다. `executorId` 값을 활용하여 호출을 식별하고 처리할 수 있습니다. `dataHandlerExecutorInterceptor` 함수를 배열로 입력받을 수 있으며, 입력받은 함수들을 순차적으로 실행합니다.

  * Arguments
    
    * previousExecutorData
      
      * 이전 `dataHandlerExecutorInterceptor`에서 반환된 값 입니다. 이전 처리된 반환값이 존재하지 않는 경우 `undefined` 값 입니다.
    
    * dataHandlerExecutor
      
      * `useRenderState` 에서 반환한 `handleData` 함수에서 정의한 데이터 처리 구현 함수 입니다. 이 함수를 그대로 실행하여 실제 코드에서 구현한 값을 실행하거나 무시할 수 있습니다.
    
    * executorId
      
      * `handleData` 함수 호출을 식별하기 위한 `executorId` 입니다. 이 값은 `undefined` 일 수 있습니다.
  
  * Returns
    
    * 반환 값은 `useRenderState` 훅 함수의 `handleData` 및 `render` 함수 결과에 전달됩니다.


### Store

```tsx
...
const store = useMemo(() => {
  return Store.createStore({ debug: true });
}, []);
```

`useRenderState` 훅 데이터가 저장되는 공간 입니다. `store` 객체를 직접 생성하여 설정하지 않는 경우 내부적으로 자동으로 생성하여 사용합니다.

> 옵션 설정을 변경하고자 한다면 Store를 직접 생성하여 `RenderStateProvider`를 통해 설정해 주세요.

#### createStore


* Arguments

* `options`

  * `debug`

    * `useRenderState` 훅 함수를 통해 `store`에 데이터를 변경 할 때마다 상태정보를 `console.log`를 통해 표시해 줍니다.

* returns
  
  * 설정된 Store 객체를 반환