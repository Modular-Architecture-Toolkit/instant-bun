type DataGenerator<T> = () => T

interface DataGenerators {
  string: (generator?: DataGenerator<string>) => string
  number: (generator?: DataGenerator<number>) => number
  boolean: (generator?: DataGenerator<boolean>) => boolean
  date: (generator?: DataGenerator<Date>) => Date
  object: <T extends Record<string, any>>(
    shape: T,
    generatorMap?: Partial<Record<keyof T, DataGenerator<any>>>
  ) => DataGenerator<T>
  array: <T>(generator: DataGenerator<T>, length?: number) => DataGenerator<T[]>
}

export const dataGenerators: DataGenerators = {
  string: (generator = () => 'Some random string') => generator(),
  number: (generator = () => Math.random() * 100) => generator(),
  boolean: (generator = () => Math.random() < 0.5) => generator(),
  date: (generator = () => new Date()) => generator(),
  object: <T extends Record<string, any>>(
    shape: T,
    generatorMap: Partial<Record<keyof T, DataGenerator<any>>> = {}
  ) => {
    return () => {
      const result = {} as any
      for (const key in shape) {
        const generator = generatorMap[key as keyof T] || shape[key]
        if (typeof generator === 'function') {
          result[key] = generator()
        } else {
          result[key] = inferTypeAndGenerate(generator)
        }
      }
      return result as T
    }
  },
  array: <T>(generator: DataGenerator<T>, length = 10) => {
    return () => {
      const result = []
      for (let i = 0; i < length; i++) {
        result.push(generator())
      }
      return result
    }
  },
}

export const inferTypeAndGenerate = <Val>(value: Val): any => {
  switch (typeof value) {
    case 'string':
      return dataGenerators.string()
    case 'number':
      return dataGenerators.number()
    case 'boolean':
      return dataGenerators.boolean()
    default:
      if (value instanceof Date) {
        return dataGenerators.date()
      } else if (Array.isArray(value)) {
        // Use first item in the array to infer type for array items
        // This is a simplification and assumes uniform array types
        const inferredTypeGenerator = inferTypeAndGenerate(value[0])
        return dataGenerators.array(() => inferredTypeGenerator, value.length)()
      } else if (typeof value === 'object' && value !== null) {
        return dataGenerators.object(value as Record<string, any>)()
      }
  }

  return null
}
