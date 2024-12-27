export type FileExtensionType = {
  name: string
  description: string
  logoUrl: string
  mime: string
  encoding: string
}

const defaultExtensionInfo: FileExtensionType = {
  name: 'Unknown',
  description: 'Unknown',
  logoUrl: '',
  mime: '',
  encoding: '',
}

type ExtensionMap = {
  [key: string]: FileExtensionType
}

export const fileExtensionMap = {
  ts: {
    name: 'TypeScript',
    description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
    logoUrl: 'https://raw.githubusercontent.com/github/explore/master/topics/typescript/typescript.png',
    mime: 'application/typescript',
    encoding: 'utf-8',
  },
  tsx: {
    name: 'TypeScript JSX',
    description: 'Used with React in TypeScript projects.',
    logoUrl: '',
    mime: 'application/typescript',
    encoding: 'utf-8',
  },
  js: {
    name: 'JavaScript',
    description: 'A lightweight, interpreted, or just-in-time compiled programming language.',
    logoUrl: '',
    mime: 'application/javascript',
    encoding: 'utf-8',
  },
  jsx: {
    name: 'JavaScript JSX',
    description: 'Used with React in JavaScript projects.',
    logoUrl: '',
    mime: 'application/javascript',
    encoding: 'utf-8',
  },
  json: {
    name: 'JSON',
    description: 'JavaScript Object Notation.',
    logoUrl: '',
    mime: 'application/json',
    encoding: 'utf-8',
  },
  toml: {
    name: 'TOML',
    description: "Tom's Obvious, Minimal Language.",
    logoUrl: '',
    mime: 'application/toml',
    encoding: 'utf-8',
  },
  md: {
    name: 'Markdown',
    description: 'A lightweight markup language.',
    logoUrl: '',
    mime: 'text/markdown',
    encoding: 'utf-8',
  },
  html: {
    name: 'HTML',
    description: 'Hypertext Markup Language.',
    logoUrl: '',
    mime: 'text/html',
    encoding: 'utf-8',
  },
  css: {
    name: 'CSS',
    description: 'Cascading Style Sheets.',
    logoUrl: '',
    mime: 'text/css',
    encoding: 'utf-8',
  },
  cpp: {
    name: 'C++',
    description: 'C++ programming language.',
    logoUrl: '',
    mime: 'text/x-c++',
    encoding: 'utf-8',
  },
  rs: {
    name: 'Rust',
    description: 'A language empowering everyone to build reliable and efficient software.',
    logoUrl: '',
    mime: 'text/rust',
    encoding: 'utf-8',
  },
  c: {
    name: 'C',
    description: 'C programming language.',
    logoUrl: '',
    mime: 'text/x-c',
    encoding: 'utf-8',
  },
  py: {
    name: 'Python',
    description: 'A high-level, interpreted scripting language.',
    logoUrl: '',
    mime: 'text/x-python',
    encoding: 'utf-8',
  },
  txt: {
    name: 'Text',
    description: 'Plain text file.',
    logoUrl: '',
    mime: 'text/plain',
    encoding: 'utf-8',
  },
  jpeg: {
    name: 'JPEG',
    description: 'JPEG image format.',
    logoUrl: '',
    mime: 'image/jpeg',
    encoding: '',
  },
  jpg: {
    name: 'JPG',
    description: 'JPG image format.',
    logoUrl: '',
    mime: 'image/jpeg',
    encoding: '',
  },
  png: {
    name: 'PNG',
    description: 'Portable Network Graphics.',
    logoUrl: '',
    mime: 'image/png',
    encoding: '',
  },
  zip: {
    name: 'ZIP',
    description: 'ZIP file format.',
    logoUrl: '',
    mime: 'application/zip',
    encoding: '',
  },
  gzip: {
    name: 'GZIP',
    description: 'GNU zip, a file compression format.',
    logoUrl: '',
    mime: 'application/gzip',
    encoding: '',
  },
  xml: {
    name: 'XML',
    description: 'eXtensible Markup Language.',
    logoUrl: '',
    mime: 'application/xml',
    encoding: 'utf-8',
  },
  svg: {
    name: 'SVG',
    description: 'Scalable Vector Graphics.',
    logoUrl: '',
    mime: 'image/svg+xml',
    encoding: 'utf-8',
  },
  gif: {
    name: 'GIF',
    description: 'Graphics Interchange Format.',
    logoUrl: '',
    mime: 'image/gif',
    encoding: '',
  },
  pdf: {
    name: 'PDF',
    description: 'Portable Document Format.',
    logoUrl: '',
    mime: 'application/pdf',
    encoding: '',
  },
  mp3: {
    name: 'MP3',
    description: 'Audio file format.',
    logoUrl: '',
    mime: 'audio/mpeg',
    encoding: '',
  },
  mp4: {
    name: 'MP4',
    description: 'Video file format.',
    logoUrl: '',
    mime: 'video/mp4',
    encoding: '',
  },
  doc: {
    name: 'DOC',
    description: 'Microsoft Word document.',
    logoUrl: '',
    mime: 'application/msword',
    encoding: '',
  },
  docx: {
    name: 'DOCX',
    description: 'Microsoft Word Open XML document.',
    logoUrl: '',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    encoding: '',
  },
  xls: {
    name: 'XLS',
    description: 'Microsoft Excel spreadsheet.',
    logoUrl: '',
    mime: 'application/vnd.ms-excel',
    encoding: '',
  },
  xlsx: {
    name: 'XLSX',
    description: 'Microsoft Excel Open XML spreadsheet.',
    logoUrl: '',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    encoding: '',
  },
  ppt: {
    name: 'PPT',
    description: 'Microsoft PowerPoint presentation.',
    logoUrl: '',
    mime: 'application/vnd.ms-powerpoint',
    encoding: '',
  },
  pptx: {
    name: 'PPTX',
    description: 'Microsoft PowerPoint Open XML presentation.',
    logoUrl: '',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    encoding: '',
  },
  odt: {
    name: 'ODT',
    description: 'OpenDocument Text Document.',
    logoUrl: '',
    mime: 'application/vnd.oasis.opendocument.text',
    encoding: '',
  },
  ods: {
    name: 'ODS',
    description: 'OpenDocument Spreadsheet Document.',
    logoUrl: '',
    mime: 'application/vnd.oasis.opendocument.spreadsheet',
    encoding: '',
  },
  odp: {
    name: 'ODP',
    description: 'OpenDocument Presentation Document.',
    logoUrl: '',
    mime: 'application/vnd.oasis.opendocument.presentation',
    encoding: '',
  },
} satisfies ExtensionMap

export type ExtensionMapKeys = keyof typeof fileExtensionMap

export const fullMimeForExtension = (extension: ExtensionMapKeys) => {
  let extensionType = fileExtensionMap[extension] ?? defaultExtensionInfo

  // If there's no encoding specified, return just the MIME type.
  if (!extensionType.encoding) {
    return extensionType.mime
  }

  // Otherwise, return MIME type with encoding.
  return `${extensionType.mime};charset=${extensionType.encoding}`
}
