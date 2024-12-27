import { type HtmlTags, SELF_CLOSING_TAGS, htmlTags } from './constants'
import { generateCSS, generateColorVariables } from './css-engine'
import type { HTMLodyPlugin } from './htmlody-plugins'
import type { ExtensionRec, JsonHtmlNodeTree, JsonTagElNode } from './htmlody-types'
import { formatAttributes, isValidAttributesString, isValidHtmlTag } from './htmlody-utils'

export function validateTagName(tagName: HtmlTags): string {
  if (!isValidHtmlTag(tagName)) {
    throw new Error(`Invalid tag name provided: ${tagName}`)
  }
  return tagName
}

export function getValidatedAttributesStr(attributesStr: string): string {
  if (attributesStr !== '' && !isValidAttributesString(attributesStr)) {
    throw new Error(`Invalid attributes string provided: ${attributesStr}`)
  }
  return attributesStr
}

export function getHtmlTags(tagName: string, attributesStr: string): { startTag: string; closeTag: string } {
  const space = attributesStr ? ' ' : ''

  // Check if the tag is a self-closing tag using Set lookup
  if (SELF_CLOSING_TAGS.has(tagName)) {
    return {
      startTag: `<${tagName}${space}${attributesStr} />`,
      closeTag: '',
    }
  }

  return {
    startTag: `<${tagName}${space}${attributesStr}>`,
    closeTag: `</${tagName}>`,
  }
}

export function renderHtmlTag({
  attributesStr,
  childrenHtml,
  content,
  tagName,
  validate,
}: {
  tagName: HtmlTags
  attributesStr: string
  content: string
  childrenHtml: string
  validate?: boolean
}): string {
  if (validate) {
    validateTagName(tagName)
  }

  const validatedAttributesStr = getValidatedAttributesStr(attributesStr)
  const { startTag, closeTag } = getHtmlTags(
    // validatedTagName,
    tagName,
    validatedAttributesStr
  )

  return `${startTag}${content}${childrenHtml}${closeTag}`
}

export function renderChildrenNodes<Plugins extends HTMLodyPlugin<any>[]>(
  children: JsonHtmlNodeTree,
  plugins: Plugins
): string {
  return Object.entries(children)
    .map(([childTagName, childNode]) => jsonToHtml({ [childTagName]: childNode }, plugins))
    .join('')
}

function processNodeWithPlugins<
  Plugins extends HTMLodyPlugin<any>[],
  PluginProps extends ExtensionRec,
  Node extends JsonTagElNode<PluginProps> = JsonTagElNode<PluginProps>,
>(node: Node, plugins: Plugins): Node {
  let processedNode = { ...node }
  for (const plugin of plugins) {
    processedNode = plugin.processNode(processedNode)
  }
  return processedNode
}

export type JSONToHTMLOptions = {
  validateHtmlTags?: boolean
}

export function renderNodeToHtml<
  Plugins extends HTMLodyPlugin<any>[],
  PluginProps extends ExtensionRec,
  Node extends JsonTagElNode<PluginProps> = JsonTagElNode<PluginProps>,
>(node: Node, plugins: Plugins, options?: JSONToHTMLOptions): string {
  node = processNodeWithPlugins(node, plugins)

  const idAttribute = node.attributes?.id ? `id="${node.attributes.id}"` : ''

  const tagName = node.tag

  const content = node?.content || ''
  if (!tagName) {
    throw new Error(
      `Tag name not provided for node. 
      ${idAttribute ? `ID: ${idAttribute}` : ''}
      ${content ? `Content: ${content}` : ''}

      ${JSON.stringify(node, null, 2)}
      `
    )
  }

  const attributesStr = formatAttributes(node.attributes || {})
  const childrenHtml = node.child ? renderChildrenNodes(node.child, plugins) : ''

  return renderHtmlTag({ tagName, attributesStr, content, childrenHtml })
}

export function jsonToHtml<
  Plugins extends HTMLodyPlugin<any>[],
  PluginProps extends ExtensionRec,
  Node extends JsonTagElNode<PluginProps> = JsonTagElNode<PluginProps>,
  NodeMap extends JsonHtmlNodeTree<Node> = JsonHtmlNodeTree<Node>,
>(nodeMap: NodeMap, plugins: Plugins, options?: JSONToHTMLOptions): string {
  return Object.keys(nodeMap)
    .map((id) => renderNodeToHtml(nodeMap[id], plugins, options))
    .join('')
}

export function renderNodeWithPlugins<
  Plugins extends HTMLodyPlugin<any>[],
  PluginProps extends ExtensionRec,
  Node extends JsonTagElNode<PluginProps> = JsonTagElNode<PluginProps>,
>(node: Node, plugins: Plugins, options?: JSONToHTMLOptions): string {
  node = processNodeWithPlugins(node, plugins)

  const tagName = node.tag
  const content = node.content || ''
  if (!tagName) {
    const idAttribute = node.attributes?.id ? `id="${node.attributes.id}"` : ''
    throw new Error(
      `Tag name not provided for node. 
      ${idAttribute ? `ID: ${idAttribute}` : ''}
      ${content ? `Content: ${content}` : ''}

      ${JSON.stringify(node, null, 2)}
      `
    )
  }

  const attributesStr = formatAttributes(node.attributes || {})
  const childrenHtml = node.child ? renderChildrenNodes(node.child, plugins) : ''

  return renderHtmlTag({
    tagName,
    attributesStr,
    content,
    childrenHtml,
    validate: options?.validateHtmlTags,
  })
}

const generateTitleNode = (title: string): JsonTagElNode => {
  return {
    tag: 'title',
    content: title,
  }
}

const generateMetaTagNode = (meta: {
  name: string
  content: string
}): JsonTagElNode => {
  return {
    tag: 'meta',
    attributes: { name: meta.name, content: meta.content },
  }
}

const generateLinkTagNode = (link: {
  rel: string
  href: string
}): JsonTagElNode => {
  return {
    tag: 'link',
    attributes: { rel: link.rel, href: link.href },
  }
}

const generateStyleTagNode = (content: string): JsonTagElNode => {
  return {
    tag: 'style',
    content,
  }
}

const generateScriptTagNode = (script: {
  src?: string
  type?: string
  content: string
}): JsonTagElNode => {
  const node: JsonTagElNode = {
    tag: 'script',
    attributes: {},
    content: script.content,
  }

  if (script.src && node.attributes) {
    node.attributes.src = script.src
  }

  if (script.type && node.attributes) {
    node.attributes.type = script.type
  }

  return node
}

export type NodePluginsMapper<Plugins extends HTMLodyPlugin<any>[]> = ReturnType<Plugins[number]['processNode']>

type HeadConfig = {
  title: string
  metaTags?: { name: string; content: string }[]
  linkTags?: { rel: string; href: string }[]
  styleTags?: { content: string }[]
  scriptTags?: { src?: string; type: string; content: string }[]
}



export const htmlodyNodeFactory = <
  Plugins extends HTMLodyPlugin<any>[],
  NodeWithPlugins extends NodePluginsMapper<Plugins>,
  ReturnType extends Record<HtmlTags, (options?: Omit<NodeWithPlugins, 'tag'>) => JsonTagElNode> = Record<
    HtmlTags,
    (options?: Omit<NodeWithPlugins, 'tag'>) => JsonTagElNode
  >,
>(): ReturnType => {
  const create = (tag: HtmlTags, options?: Omit<NodeWithPlugins, 'tag'>) => {
    return {
      tag,
      content: '',
      attributes: {},
      ...options,
    } as JsonTagElNode<NodeWithPlugins>
  }

  const buildFns = {} as ReturnType

  for (const tag of htmlTags) {
    buildFns[tag] = (options?: Omit<NodeWithPlugins, 'tag'>) => create(tag, options)
  }

  return buildFns
}

export const htmlodyBuilder = <
  Plugins extends HTMLodyPlugin<any>[],
  PluginReturns extends NodePluginsMapper<Plugins>,
>({
  plugins,
  options: builderOptions,
}: {
  plugins: Plugins
  options?: {
    allpages: {
      headConfig?: HeadConfig
    }
  }
}) => {
  const effectivePlugins = plugins

  const nodeFactory = () => {
    return htmlodyNodeFactory<Plugins, PluginReturns>()
  }

  const inferTreeFn = <
    Node extends JsonTagElNode<PluginReturns> = JsonTagElNode<PluginReturns>,
  >(): JsonHtmlNodeTree<Node> => {
    return undefined as unknown as JsonHtmlNodeTree<Node>
  }

  const inferTree = inferTreeFn()

  const renderNodeTreeToHtml = (nodeMap: JsonHtmlNodeTree, pluginsOverride?: Plugins): string => {
    const activePlugins = pluginsOverride || effectivePlugins
    return Object.keys(nodeMap)
      .map((id) => {
        const node = nodeMap[id]
        const childrenHtml = node.child ? renderNodeTreeToHtml(node.child, activePlugins) : ''
        return renderNodeWithPlugins(
          {
            ...node,
            content: node.content || '', // Remove childrenHtml from here
            child: node.child, // Pass child to renderNodeWithPlugins
          },
          activePlugins
        )
      })
      .join('')
  }

  const renderSingleNode = <Node extends JsonTagElNode<PluginReturns> = JsonTagElNode<PluginReturns>>(
    node: Node,
    pluginsOverride?: Plugins
  ): string => {
    const activePlugins = pluginsOverride || effectivePlugins
    return renderNodeWithPlugins(node, activePlugins)
  }

  const renderChildren = (children: JsonHtmlNodeTree, pluginsOverride?: Plugins): string => {
    const activePlugins = pluginsOverride || effectivePlugins
    return Object.entries(children)
      .map(([childTagName, childNode]) => renderNodeWithPlugins(childNode, activePlugins))
      .join('')
  }

  const buildHtmlDoc = <JSONNodeTree extends JsonHtmlNodeTree = JsonHtmlNodeTree<PluginReturns>>(
    bodyConfig: JSONNodeTree,
    options?: {
      headConfig?: HeadConfig
    }
  ) => {
    const headNodes: JsonHtmlNodeTree = {}

    if (options?.headConfig?.title) {
      headNodes['title'] = generateTitleNode(options.headConfig.title)
    }

    if (builderOptions?.allpages?.headConfig?.title) {
      headNodes['title'] = generateTitleNode(builderOptions?.allpages?.headConfig.title)
    }

    if (options?.headConfig?.metaTags) {
      options.headConfig.metaTags.forEach((meta, index) => {
        headNodes[`meta${index}`] = generateMetaTagNode(meta)
      })
    }

    if (builderOptions?.allpages?.headConfig?.metaTags) {
      builderOptions?.allpages?.headConfig.metaTags.forEach((meta, index) => {
        headNodes[`meta${index}`] = generateMetaTagNode(meta)
      })
    }

    if (options?.headConfig?.linkTags) {
      options.headConfig.linkTags.forEach((link, index) => {
        headNodes[`link${index}`] = generateLinkTagNode(link)
      })
    }

    if (builderOptions?.allpages?.headConfig?.linkTags) {
      builderOptions?.allpages?.headConfig.linkTags.forEach((link, index) => {
        headNodes[`link${index}`] = generateLinkTagNode(link)
      })
    }

    if (options?.headConfig?.styleTags) {
      options.headConfig.styleTags.forEach((style, index) => {
        headNodes[`style${index}`] = generateStyleTagNode(style.content)
      })
    }

    if (builderOptions?.allpages?.headConfig?.styleTags) {
      builderOptions?.allpages?.headConfig.styleTags.forEach((style, index) => {
        headNodes[`style${index}`] = generateStyleTagNode(style.content)
      })
    }
    if (options?.headConfig?.scriptTags) {
      options.headConfig.scriptTags.forEach((script, index) => {
        headNodes[`script${index}`] = generateScriptTagNode(script)
      })
    }

    if (builderOptions?.allpages?.headConfig?.scriptTags) {
      builderOptions?.allpages?.headConfig.scriptTags.forEach((script, index) => {
        headNodes[`script${index}`] = generateScriptTagNode(script)
      })
    }

    const headHtml = renderNodeTreeToHtml(headNodes)
    const bodyHtml = renderNodeTreeToHtml(bodyConfig)

    // todo this needs to be externalized since this is specific to the class records plugin
    const css = generateCSS(bodyConfig)
    const colorVariables = generateColorVariables()

    return `
      <!doctype html>
      <html>
        <head>
          ${headHtml}
          <style>${colorVariables}</style>
          <style>${css}</style>
        </head>
        <body>
          ${bodyHtml}
        </body>
      </html>
    `
  }

  const response = (
    bodyConfig: JsonHtmlNodeTree,
    options?: {
      headConfig?: HeadConfig
    }
  ) => {
    const html = buildHtmlDoc(bodyConfig, options)
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  const warp = ({ id, src }: { id: string; src: string }) => {
    const turboFrameNode = ({
      id,
      src,
      children,
    }: {
      id: string
      src?: string
      children: JsonHtmlNodeTree<PluginReturns>
    }) => {
      const turboFrame: JsonTagElNode = {
        tag: 'turbo-frame',
        attributes: {
          id,
        },
        child: children,
      }

      if (src && turboFrame?.attributes) {
        turboFrame.attributes.src = src
      }

      return turboFrame
    }

    return {
      pushNode: (content: JsonTagElNode<PluginReturns>) => {
        const tfNode = turboFrameNode({
          id,
          children: {
            CONTENT: content,
          },
        })

        return renderSingleNode(tfNode)
      },
      docNodeMount: (content: JsonTagElNode<PluginReturns>) => {
        return turboFrameNode({
          id,
          src,
          children: {
            CONTENT: content,
          },
        })
      },
    }
  }

  return {
    nodeFactory,
    renderNodeTreeToHtml,
    renderSingleNode,
    renderChildren,
    buildHtmlDoc,
    response,
    inferTree,
    warp,
  }
}
