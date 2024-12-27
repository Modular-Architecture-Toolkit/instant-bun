import { describe, expect, it } from 'bun:test'
import { type JsonHtmlNodeTree, type JsonTagElNode, jsonToHtml } from '.'
import {
  type CRNode,
  type ClassRecordAttributes,
  classRecordPlugin,
  classRecordPluginHandler,
  markdownPlugin,
} from './htmlody-plugins'

describe('classRecordPluginHandler', () => {
  it('should add classes to attributes based on ClassRecord', () => {
    const node: CRNode = {
      tag: 'div',
      cr: {
        '*': {
          'border-gray-50': true,
          'border-blue-100': false,
          'bg-blue-100': true,
        },
      },
      attributes: {
        id: 'sample-id',
      },
      content: 'Sample Content',
    }
    const processedNode = classRecordPluginHandler(node)
    expect(processedNode.attributes?.class).toBe('border-gray-50 bg-blue-100')
  })

  it('should not add classes to attributes if ClassRecord is not present', () => {
    const node: CRNode = {
      tag: 'div',
      attributes: {
        id: 'sample-id',
      },
      content: 'Sample Content',
    }
    const processedNode = classRecordPluginHandler(node)
    expect(processedNode.attributes?.class).toBe(undefined)
  })
})

describe('classRecordPlugin', () => {
  const sampleNodeMap: JsonHtmlNodeTree<JsonTagElNode & ClassRecordAttributes> = {
    div1: {
      tag: 'div',
      cr: {
        '*': {
          'bg-blue-100': true,
          'bg-gray-100': false,
          'bg-red-100': true,
        },
      },
      content: 'Hello World!',
    },
    div2: {
      tag: 'div',
      cr: {
        '*': {
          'bg-blue-100': true,
        },
      },
      content: 'Another div',
    },
  }

  it('should add classes based on the ClassRecord', () => {
    const renderedHtml = jsonToHtml(sampleNodeMap, [classRecordPlugin])
    expect(renderedHtml).toContain('<div class="bg-blue-100 bg-red-100">Hello World!</div>')
    expect(renderedHtml).toContain('<div class="bg-blue-100">Another div</div>')
  })

  it('should not add classes with a value of false', () => {
    const renderedHtml = jsonToHtml(sampleNodeMap, [classRecordPlugin])
    expect(renderedHtml).not.toContain('class-two')
  })
})

describe('Markdown Plugin with jsonToHtml', () => {
  it('should convert a simple markdown text to HTML', () => {
    const input = {
      sampleId: {
        tag: 'div',
        markdown: '# Hello\nThis is **bold**.',
      },
    }

    const output = jsonToHtml(input, [markdownPlugin])

    const expectedOutput = `<div><h1>Hello</h1>\n<p>This is <strong>bold</strong>.</p></div>`
    expect(output).toBe(expectedOutput)
  })

  it('should handle nodes without markdown', () => {
    const input = {
      sampleId: {
        tag: 'div',
        content: 'Just a regular div.',
      },
    }

    const output = jsonToHtml(input, [markdownPlugin])

    const expectedOutput = `<div>Just a regular div.</div>`
    expect(output).toBe(expectedOutput)
  })
})
