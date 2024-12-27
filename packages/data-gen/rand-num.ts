export const randNum = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const randFromArray = <T>(arr: T[]) => {
  return arr[randNum(0, arr.length - 1)]
}
