export const randDateRange = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime()
  const end = endDate.getTime()
  const randomDate = new Date(start + Math.random() * (end - start))
  return randomDate
}
