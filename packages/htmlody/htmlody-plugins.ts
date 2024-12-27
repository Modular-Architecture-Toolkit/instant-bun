import { convertMarkdownToHTML } from '../utils/text-utils'
import type { ExtensionRec, JsonTagElNode, ResponsiveClassRecord } from './htmlody-types'

// this will be the node that will be attached to our json node
export type ClassRecordAttributes = {
  cr?: ResponsiveClassRecord
}

export type CRNode = JsonTagElNode<ClassRecordAttributes>
export type MDNode = JsonTagElNode<MarkdownAttributes>

export interface HTMLodyPlugin<T extends ExtensionRec = {}> {
  // need to figure out if finall return type should be with or without the type
  processNode: (node: JsonTagElNode<T>) => JsonTagElNode<T>
}

export const classRecordPluginHandler = <Node extends JsonTagElNode & { cr?: ResponsiveClassRecord }>(node: Node) => {
  let classes = ''

  if (node.cr) {
    const responsiveClasses = Object.entries(node.cr)
      .map(([breakpoint, classRecord]) => {
        const breakpointPrefix = breakpoint === '*' ? '' : `${breakpoint}_`
        const classList = Object.entries(classRecord || {})
          .filter(([, value]) => value)
          .map(([key]) => `${breakpointPrefix}${key}`)
          .join(' ')
        return classList
      })
      .join(' ')

    classes = responsiveClasses
  }

  if (classes === '') {
    return node
  }

  return {
    ...node,
    attributes: { ...node.attributes, class: classes },
  }
}

export const classRecordPlugin: HTMLodyPlugin<ClassRecordAttributes> = {
  processNode: classRecordPluginHandler,
}

export type MarkdownAttributes = {
  markdown?: string
}

export const markdownPluginHandler = <Node extends MDNode>(node: Node): JsonTagElNode => {
  if (node.markdown) {
    const htmlContent = convertMarkdownToHTML(node.markdown)
    // remove the markdown attribute after processing
    const { markdown, ...remainingAttributes } = node.attributes || {}

    return {
      ...node,
      content: htmlContent,
      attributes: remainingAttributes,
    }
  }
  return node
}

export const markdownPlugin: HTMLodyPlugin<MarkdownAttributes> = {
  processNode: markdownPluginHandler,
}
