# Type Utils

## ArrayTypesExtract
```typescript

const statsFromApiConst = [
    { testKey: "beanz" },
    { testKey: "" },
    { testKey: "popcorn" },
    { testKey: "guitar" },
    { testKey: "banana" },
    { testKey: "drums" },
  ] as const;

// usage:
type TestKey = ArrayTypesExtract<typeof statsFromApiConst, "testKey">;
```


## UnboxArray

```typescript
const test = [10, 'test']

type Test = UnboxArray<typeof test>
```


## IfFunction

```typescript
const exampleFn = (a: number, b: number) => a + b;

type ExampleFnType = IfFunction<typeof exampleFn>; // number

const exampleObj = {
  key1: 'testValue',
  key: 10
}

type ExampleObjType = IfFunction<typeof exampleObj>; // { key1: string, key2: number }
```


.

```typescript
type TestObject = {
  test: string;
  test2: string;
  test3: boolean
}

type TestObject2 = TransformValues<TestObject, string, number>;
// output type:
// {
//   test: number
//   test2: number
//   test3: boolean 
// }
```
