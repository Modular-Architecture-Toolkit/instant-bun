export const normalizeBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0)
    return {
      value: 0,
      unit: 'Bytes',
    }

  const k = 1024
  const dm = Math.abs(decimals)

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return {
    value: parseFloat((bytes / Math.pow(k, i)).toFixed(dm)),
    unit: sizes[i],
  }
}
