export const isTestFile = (meta: ImportMeta, testFileMatch: string = 'test') => {
  const splitFile = meta.file.split('.')
  const fileExtensions = splitFile.slice(1).join('.')

  return fileExtensions?.includes(testFileMatch) || false
}
