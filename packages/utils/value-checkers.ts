export function isArray<T>(input: T | any[]): input is any[] {
  return Array.isArray(input)
}

export function isObj(input: any): input is object {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

export function isNum(input: any): input is number {
  return typeof input === 'number'
}

export function isBool(input: any): input is boolean {
  return typeof input === 'boolean'
}

export function isStr(input: any): input is string {
  return typeof input === 'string'
}
