# Data Gen Module

This data generation factory provides a set of utility scripts and functions to generate various types of random data such as cities, names, countries and states.

## Usage Guide

Here is a quick guide on how to generate different types of data:

### 1. Import the required functions

You can import the functions you need as below:

```typescript
import { createRandomData, randNum, randFromArray, dataGenerators, inferTypeAndGenerate  } from 'bnkit/data-gen';
import type { DataGeneratorMapConfig }from 'bnkit/data-gen'

```

### 2. Generate Random Data

To generate random data, use `createRandomData()` function. This function accepts a configuration object that defines the shape and type of the data to be generated.

Example:

```typescript
const dataGen = {
  first: { type: "firstName" },
  age: { type: "num", min: 18, max: 65 }
} as const;

const randomData = createRandomData(dataGen);
console.log(randomData);
```

### 3. Generate Random Numbers

`randNum(min, max)` generates a random number between [min, max].

Example:

```typescript
const randomNumber = randNum(1, 10);
console.log(randomNumber);
```

`randFromArray(arr)` randomly selects an element from an array.

Example:

```typescript
const randomItem = randFromArray(['red', 'green', 'blue']);
console.log(randomItem);
```

### 4. Generate Object and Array

`dataGenerators` provides methods to generate random strings, numbers, booleans, dates, objects and arrays.

Example:

```typescript
const randomObject = dataGenerators.object({ name: 'Name', age: 20 });
console.log(randomObject());
```

`inferTypeAndGenerate(value)` function infers the type of a value and generates a similar type of data.

Example:

```typescript
const inferredData = inferTypeAndGenerate('example');
console.log(inferredData);
```

These methods can be extensively used to generate data for testing and development purposes. Play around with these functions to understand them better and use them according to your requirements.
