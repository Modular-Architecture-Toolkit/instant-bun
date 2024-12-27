type ClassName = string | number | boolean | null | undefined | ClassNameMap
interface ClassNameMap {
  [key: string]: boolean | null | undefined
}

export function classy(...args: ClassName[]): string {
  const classes: string[] = []

  for (const arg of args) {
    if (arg == null) continue

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg.toString())
    } else if (Array.isArray(arg)) {
      classes.push(classy(...arg))
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

export default classy
