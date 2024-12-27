export function replaceMarkdown(text: string, regex: RegExp, replacement: string): string {
  return text.replace(regex, replacement)
}

export const parsers = {
  headers(text: string): string {
    for (let i = 6; i > 0; i--) {
      const regex = new RegExp(`^(#{${i}}) (.*)`, 'gm')
      text = replaceMarkdown(text, regex, `<h${i}>$2</h${i}>`)
    }
    return text
  },
  bold(text: string): string {
    return replaceMarkdown(text, /\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  },
  italic(text: string): string {
    return replaceMarkdown(text, /\*(.+?)\*/g, '<em>$1</em>')
  },
  links(text: string): string {
    return replaceMarkdown(text, /\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  },
  unorderedLists(text: string): string {
    return text.replace(/(- .*(\n|$))+/g, (match) => {
      const items = match.split('\n').filter(Boolean)
      const liItems = items.map((item) => item.replace(/- (.*)/, '<li>$1</li>')).join('\n')
      return `<ul>${liItems}</ul>`
    })
  },

  orderedLists(text: string): string {
    return text.replace(/(\d+\. .*(\n|$))+/g, (match) => {
      const items = match.split('\n').filter(Boolean)
      const liItems = items.map((item) => item.replace(/\d+\. (.*)/, '<li>$1</li>')).join('\n')
      return `<ol>${liItems}</ol>`
    })
  },

  blockquotes(text: string): string {
    return replaceMarkdown(text, /^>\s(.+)/gm, '<blockquote>$1</blockquote>')
  },
  codeBlocks(text: string): string {
    return replaceMarkdown(text, /```(.+?)```/gs, '<pre><code>$1</code></pre>')
  },
  inlineCode(text: string): string {
    return replaceMarkdown(text, /`(.+?)`/g, '<code>$1</code>')
  },
  paragraphs(text: string): string {
    // Wrap lines not starting with HTML tags in <p> tags
    return text.replace(/^(?!<.*>)(.+)$/gm, '<p>$1</p>')
  },
}

export function convertMarkdownToHTML(markdownText: string): string {
  let html = markdownText
  const parserOrder: Array<keyof typeof parsers> = [
    'headers',
    'bold',
    'italic',
    'links',
    'unorderedLists',
    'orderedLists',
    'blockquotes',
    'codeBlocks',
    'inlineCode',
    'paragraphs',
  ]
  for (const parserName of parserOrder) {
    html = parsers[parserName](html)
  }
  return html
}
