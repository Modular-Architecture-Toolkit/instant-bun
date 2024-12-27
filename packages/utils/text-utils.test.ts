import { describe, expect, test } from 'bun:test'
import { convertMarkdownToHTML, parsers, replaceMarkdown } from './text-utils'
describe('HTML and Markdown utilities', () => {
  // Testing Markdown related functions
  describe('Markdown conversion', () => {
    // replaceMarkdown function
    test('replaceMarkdown replaces patterns correctly', () => {
      const markdown = '**Hello**'
      const regex = /\*\*(.+?)\*\*/g
      const replacement = '<strong>$1</strong>'
      const expectedHTML = '<strong>Hello</strong>'
      expect(replaceMarkdown(markdown, regex, replacement)).toEqual(expectedHTML)
    })

    // parsers object
    test('convertMarkdownToHTML converts markdown to HTML', () => {
      const markdown = '# Hello\n**World**\n*This* is a [link](https://example.com)'
      const expectedHTML =
        '<h1>Hello</h1>\n<strong>World</strong>\n<em>This</em> is a <a href="https://example.com">link</a>'
      expect(convertMarkdownToHTML(markdown)).toEqual(expectedHTML)
    })

    // convertMarkdownToHTML function
    test('convertMarkdownToHTML converts markdown to HTML', () => {
      const markdown = '# Hello\n**World**\n*This* is a [link](https://example.com)'
      const expectedHTML =
        '<h1>Hello</h1>\n<strong>World</strong>\n<em>This</em> is a <a href="https://example.com">link</a>'
      expect(convertMarkdownToHTML(markdown)).toEqual(expectedHTML)
    })
  })
})

describe('Markdown Parsers', () => {
  test('headers parser', () => {
    const input = '# Heading 1\n## Heading 2\n### Heading 3'
    const output = parsers.headers(input)
    expect(output).toBe('<h1>Heading 1</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>')
  })

  test('bold parser', () => {
    const input = '**bold text**'
    const output = parsers.bold(input)
    expect(output).toBe('<strong>bold text</strong>')
  })

  test('italic parser', () => {
    const input = '*italic text*'
    const output = parsers.italic(input)
    expect(output).toBe('<em>italic text</em>')
  })

  test('links parser', () => {
    const input = '[an example](http://example.com/)'
    const output = parsers.links(input)
    expect(output).toBe('<a href="http://example.com/">an example</a>')
  })

  test('unorderedLists parser', () => {
    const input = '- item 1\n- item 2'
    const output = parsers.unorderedLists(input)
    expect(output).toBe('<ul><li>item 1</li>\n<li>item 2</li></ul>')
  })

  test('orderedLists parser', () => {
    const input = '1. item 1\n2. item 2'
    const output = parsers.orderedLists(input)
    expect(output).toBe('<ol><li>item 1</li>\n<li>item 2</li></ol>')
  })

  test('blockquotes parser', () => {
    const input = '> blockquote'
    const output = parsers.blockquotes(input)
    expect(output).toBe('<blockquote>blockquote</blockquote>')
  })

  test('codeBlocks parser', () => {
    const input = '```\nconst a = 10;\n```'
    const output = parsers.codeBlocks(input)
    expect(output).toBe('<pre><code>\nconst a = 10;\n</code></pre>')
  })

  test('inlineCode parser', () => {
    const input = '`const a = 10;`'
    const output = parsers.inlineCode(input)
    expect(output).toBe('<code>const a = 10;</code>')
  })
})
