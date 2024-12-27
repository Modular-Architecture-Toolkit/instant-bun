import { describe, expect, it } from 'bun:test'
import { saveOrUpdateFile } from './file-editing-utils'

import { readFileContent } from './file-reading-utils'
import { deletePath } from './file-validation-utils'

const savePath = process.env.PWD + '/files-folders/test'

describe('saveResultToFile', () => {
  it('should save and update content to file', async () => {
    const saveFile = savePath + '/test.text'

    const content = 'Hello, world!'

    await saveOrUpdateFile({ filePath: saveFile, content })

    const fileContent = await readFileContent(saveFile)

    expect(fileContent).toEqual(content)

    const newFileContent = 'Goodbye, world!'
    await saveOrUpdateFile({ filePath: saveFile, content: newFileContent })

    const newReadFileContent = await readFileContent(saveFile)

    expect(newReadFileContent).toEqual(newFileContent)

    await deletePath(saveFile)
  })
})
