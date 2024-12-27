import { describe, expect, it } from 'bun:test'
import type { JsonTagElNode } from 'bnkit/htmlody'
import type { Attributes } from './htmlody-types'
import { collectClassNames, formatAttributes, nodeFactory, retrieveElement } from './htmlody-utils'

describe('formatAttributes', () => {
  it('should handle empty attributes', () => {
    const attributes: Attributes = {}
    // @ts-expect-error
    const formatted = formatAttributes(attributes, {})
    expect(formatted).toBe('')
  })
})

describe('formatAttributes', () => {
  it('should format attributes into string', () => {
    const attributes: Attributes = {
      id: `id-${Math.floor(Math.random() * 1000)}`,
      class: 'sample-class',
    }
    // @ts-expect-error
    const formatted = formatAttributes(attributes, {})
    expect(formatted).toContain(attributes.id)
    expect(formatted).toContain(attributes.class)
  })
})

describe('retrieveElement', () => {
  it('should retrieve an element from a JsonHtmlNodeMap', () => {
    const JsonHtmlNodeMap = {
      div: {
        tag: 'div',
        attributes: {
          class: 'sample-class',
        },
        content: 'Sample Content',
      },
    }
    const element = retrieveElement(JsonHtmlNodeMap, 'div')
    expect(element).toEqual({
      tag: 'div',
      attributes: {
        class: 'sample-class',
      },
      content: 'Sample Content',
    })
  })

  it('should return undefined if the element is not present in the JsonHtmlNodeMap', () => {
    const JsonHtmlNodeMap = {
      div: {
        tag: 'div',
        attributes: {
          class: 'sample-class',
        },
        content: 'Sample Content',
      },
    }
    // @ts-expect-error
    const element = retrieveElement(JsonHtmlNodeMap, 'span')
    expect(element).toBeUndefined()
  })
})

describe('nodeFactory', () => {
  it('should create a new node with the given configuration', () => {
    const nodeConfig = {
      tag: 'div',
      attributes: {
        class: 'sample-class',
        id: 'sample-id',
      },
      content: 'Sample Content',
    }
    const factory = nodeFactory(nodeConfig)
    const newNode = factory.create()
    expect(newNode).toEqual({
      tag: 'div',
      attributes: {
        class: 'sample-class',
        id: 'sample-id',
      },
      content: 'Sample Content',
    })
  })
})

describe('collectClassNames', () => {
  it('should add class names to uniqueClassNames set', () => {
    const node = {
      tag: 'div',
      attributes: {
        class: 'sample-class-1 sample-class-2',
      },
      content: 'Sample Content',
    }
    const uniqueClassNames = new Set<string>()
    collectClassNames(node, uniqueClassNames)
    expect(uniqueClassNames).toEqual(new Set(['sample-class-1', 'sample-class-2']))
  })

  it('should not add class names to uniqueClassNames set if class attribute is not present', () => {
    const node = {
      tag: 'div',
      content: 'Sample Content',
    }
    const uniqueClassNames = new Set<string>()
    collectClassNames(node, uniqueClassNames)
    expect(uniqueClassNames).toEqual(new Set())
  })

  it('should not add class names to uniqueClassNames set if class attribute is not a string', () => {
    const node: JsonTagElNode = {
      tag: 'div',
      attributes: {
        // @ts-expect-error
        class: 123,
      },
      content: 'Sample Content',
    }
    const uniqueClassNames = new Set<string>()
    collectClassNames(node, uniqueClassNames)
    expect(uniqueClassNames).toEqual(new Set())
  })
})
