export type FileDirInfo = {
  type: 'file' | 'directory' | 'other'
  name: string
  fullPath: string
  size: number
  extension: string
}

export type FileWithContent = FileDirInfo & {
  content: string
  type: 'file'
}
