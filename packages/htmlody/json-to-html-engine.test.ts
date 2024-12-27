import { describe, expect, it } from 'bun:test'
import { type HTMLodyPlugin, classRecordPlugin, markdownPlugin } from './htmlody-plugins'
import type { Attributes, JsonHtmlNodeTree } from './htmlody-types'
import { formatAttributes, isValidAttributesString } from './htmlody-utils'
import {
  getHtmlTags,
  getValidatedAttributesStr,
  htmlodyBuilder,
  jsonToHtml,
  renderChildrenNodes,
  renderHtmlTag,
  renderNodeToHtml,
  renderNodeWithPlugins,
  validateTagName,
} from './json-to-html-engine'

function randomAttributes(): Attributes {
  return {
    id: `id-${Math.floor(Math.random() * 1000)}`,
    class: `class-${Math.floor(Math.random() * 1000)}`,
  }
}

function expectHtmlToMatch(html: string, expected: string) {
  expect(html.replace(/\s+/g, '')).toBe(expected.replace(/\s+/g, ''))
}

describe('renderHtmlTag', () => {
  it('should render HTML tag with attributes and content', () => {
    const tagName = 'div'
    const attributesStr = 'class="sample"'
    const content = 'Hello World'
    const childrenHtml = '<span>Child</span>'

    const rendered = renderHtmlTag({
      tagName,
      attributesStr,
      content,
      childrenHtml,
    })
    expect(rendered).toContain(tagName)
    expect(rendered).toContain(attributesStr)
    expect(rendered).toContain(content)
    expect(rendered).toContain(childrenHtml)
  })
  describe('renderHtmlTag', () => {
    it('should throw error for invalid tags', () => {
      let errorOccurred = false
      try {
        // @ts-expect-error
        renderHtmlTag({ validate: true, tagName: 'invalidTag' })
      } catch (e) {
        errorOccurred = true
        // @ts-expect-error
        expect(e.message).toBe('Invalid tag name provided: invalidTag') // If you want to check the error message
      }
      expect(errorOccurred).toBe(true)
    })
  })
  it('should handle missing content and children', () => {
    const nodeMap: JsonHtmlNodeTree = {
      div_id1: {
        tag: 'div',
        attributes: randomAttributes(),
      },
    }
    const rendered = jsonToHtml(nodeMap, [])
    expect(rendered).not.toContain('undefined')
  })
})

describe('jsonToHtml', () => {
  it('should apply plugins to nodes', () => {
    const nodeMap = {
      div: {
        tag: 'div',
        cr: {
          'sample-class': true,
        },
        content: 'Sample Content',
      },
    }
    const plugins = [
      {
        // @ts-expect-error
        processNode: (node) => {
          if (node.cr) {
            node.attributes = {
              ...node.attributes,
              class: Object.keys(node.cr)
                .filter((key) => node.cr[key])
                .join(' '),
            }
          }
          return node
        },
      },
    ]
    const html = jsonToHtml(nodeMap, plugins)
    expect(html).toBe('<div class="sample-class">Sample Content</div>')
  })

  it('should throw an error if tag name is not provided', () => {
    const nodeMap = {
      div: {
        attributes: {
          class: 'sample-class',
        },
        content: 'Sample Content',
      },
    } // @ts-expect-error
    const plugins = []

    expect(() =>
      // @ts-expect-error
      jsonToHtml(nodeMap, plugins, {
        validateHtmlTags: true,
      })
    ).toThrow(
      'Tag name not provided for node. \n      \n      Content: Sample Content\n\n      {\n  "attributes": {\n    "class": "sample-class"\n  },\n  "content": "Sample Content"\n}\n      '
    )
  })

  it('should render entire HTML structure from node map', () => {
    const nodeMap: JsonHtmlNodeTree = {
      div_id1: {
        tag: 'div',
        content: 'Sample Content',
        attributes: {
          id: 'sample-id',
          class: 'sample-class',
        },
        child: {
          span_id1: {
            tag: 'span',
            content: 'Child Content',
          },
        },
      },
    }

    const rendered = jsonToHtml(nodeMap, [])
    expect(rendered).toContain(nodeMap.div_id1.content)
    expect(rendered).toContain(nodeMap.div_id1.attributes!.id)
    expect(rendered).toContain(nodeMap.div_id1.attributes!.class)
    expect(rendered).toContain(nodeMap.div_id1.child!.span_id1.content)
  })
})

describe('renderChildren', () => {
  it('should render children recursively', () => {
    const children: JsonHtmlNodeTree = {
      div_id: {
        tag: 'div',
        content: `content-${Math.floor(Math.random() * 1000)}`,
      },
    }
    const rendered = renderChildrenNodes(children, [])
    expect(rendered).toContain(children.div_id.content)
  })
})

describe('getValidatedTagName', () => {
  it("should return the tag name if it's valid", () => {
    const tagName = 'div'
    const result = validateTagName(tagName)
    expect(result).toBe(tagName)
  })

  it('should throw an error for invalid tags', () => {
    expect(() => validateTagName('invalidTag')).toThrow('Invalid tag name provided: invalidTag')
  })
})

describe('getValidatedAttributesStr', () => {
  it("should return the attributes string if it's valid", () => {
    const attributesStr = 'id="test"'
    const result = getValidatedAttributesStr(attributesStr)
    expect(result).toBe(attributesStr)
  })

  it('should throw an error for invalid attributes string', () => {
    expect(() => getValidatedAttributesStr('invalid=attr')).toThrow('Invalid attributes string provided: invalid=attr')
  })
})

describe('getHtmlTags', () => {
  it('should return start and close tags for non-self closing tags', () => {
    const { startTag, closeTag } = getHtmlTags('div', 'class="test"')
    expect(startTag).toBe('<div class="test">')
    expect(closeTag).toBe('</div>')
  })

  it('should return only start tag for self-closing tags', () => {
    const { startTag, closeTag } = getHtmlTags('img', 'src="test.jpg"')
    expect(startTag).toBe('<img src="test.jpg" />')
    expect(closeTag).toBe('')
  })
})

describe('formatAttributes', () => {
  it('should format an attributes object into a string', () => {
    const attributes = {
      id: 'test',
      class: 'sample',
    }
    const result = formatAttributes(attributes)
    expect(result).toBe('id="test" class="sample"')
  })
})

describe('isValidAttributesString', () => {
  it('should return true for valid attributes string', () => {
    const isValid = isValidAttributesString('id="test" class="sample"')
    expect(isValid).toBe(true)
  })

  it('should return false for invalid attributes string', () => {
    const isValid = isValidAttributesString('id=test class=sample')
    expect(isValid).toBe(false)
  })
})

describe('renderNodeToHtml', () => {
  it('should throw an error if tag name is not provided', () => {
    const node = {
      attributes: {
        class: 'sample-class',
      },
      content: 'Sample Content',
    }
    // @ts-expect-error
    expect(() => renderNodeToHtml(node, [])).toThrow('Tag name not provided for node.')
  })

  it('should handle nested children in the node', () => {
    const node = {
      tag: 'div',
      attributes: {
        id: 'sample-id',
        class: 'sample-class',
      },
      child: {
        span_id1: {
          tag: 'span',
          content: 'Child Content',
        },
      },
    }

    const rendered = renderNodeToHtml(node, [])
    expectHtmlToMatch(rendered, '<div id="sample-id" class="sample-class"><span>Child Content</span></div>')
  })
})

describe('createNodeFactory', () => {
  const plugins = [classRecordPlugin, markdownPlugin] satisfies HTMLodyPlugin<any>[]

  const { nodeFactory, renderNodeTreeToHtml, renderSingleNode, renderChildren } = htmlodyBuilder({ plugins })

  describe('createNode', () => {
    it('should create a default node with a div tag', () => {
      const { div } = nodeFactory()
      const node = div()

      node.content = 'Sample Content'

      expect(node.tag).toBe('div')
    })
  })

  //renderChildren
  describe('renderChildren', () => {
    it('should render children recursively', () => {
      const children: JsonHtmlNodeTree = {
        div_id: {
          tag: 'div',
          content: `content-${Math.floor(Math.random() * 1000)}`,
        },
      }
      const rendered = renderChildren(children)
      expect(rendered).toContain(children.div_id.content)
    })
  })

  describe('renderHtml', () => {
    it('should render HTML from a node map', () => {
      const nodeMap = {
        div_id1: {
          tag: 'div',
          content: 'Sample Content',
          attributes: {
            id: 'sample-id',
            class: 'sample-class',
          },
          child: {
            span_id1: {
              tag: 'span',
              content: 'Child Content',
            },
          },
        },
      }

      const html = renderNodeTreeToHtml(nodeMap)
      expectHtmlToMatch(html, '<div id="sample-id" class="sample-class">Sample Content<span>Child Content</span></div>')
    })
  })

  // check that markdown plugin works
  it('should convert markdown to HTML', () => {
    const { div } = nodeFactory()

    const markdownDiv = div({
      markdown: '# Hello World!',
    })
    const html = renderSingleNode(markdownDiv)
    expectHtmlToMatch(html, '<div><h1>Hello World!</h1></div>')
  })

  it('should apply plugins to the node', () => {
    const { div } = nodeFactory()

    const node = div({
      cr: {
        '*': {
          'bg-blue-200': true,
        },
      },
      content: 'Sample Content',
    })

    const html = renderSingleNode(node)
    expectHtmlToMatch(html, '<div class="bg-blue-200">Sample Content</div>')
  })

  it('should render a single node to HTML', () => {
    const div = nodeFactory().div

    const node = div({
      content: 'Sample Content',
      attributes: {
        id: 'sample-id',
        class: 'sample-class',
      },
    })
    const html = renderNodeToHtml(node, [])
    expectHtmlToMatch(html, '<div id="sample-id" class="sample-class">Sample Content</div>')
  })
})

describe('renderNodeWithPlugins', () => {
  it('should throw an error if tag name is not provided', () => {
    const node = {
      attributes: {
        id: 'sample-id',
      },
      content: 'Sample Content',
    }
    const plugins = []
    expect(() => renderNodeWithPlugins(node, plugins)).toThrow(
      'Tag name not provided for node. \n      ID: id="sample-id"\n      Content: Sample Content\n\n      {\n  "attributes": {\n    "id": "sample-id"\n  },\n  "content": "Sample Content"\n}\n      '
    )
  })
})
