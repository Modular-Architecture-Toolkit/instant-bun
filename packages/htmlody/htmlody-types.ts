import { HtmlTags } from './constants'
import type { CSSMapKeys } from './css-engine'

export type Attributes = Record<string, string>

export type ClassRecord = Partial<{
  [key in CSSMapKeys]: boolean
}>

const breakpoints = ['sm', 'md', 'lg', 'xl'] as const
export type Breakpoint = (typeof breakpoints)[number]

export type ResponsiveClassRecord = {
  '*'?: ClassRecord
  sm?: ClassRecord
  md?: ClassRecord
  lg?: ClassRecord
  xl?: ClassRecord
}

export type ExtensionRec = Record<string, unknown>

export type JsonTagElNode<Ext extends ExtensionRec = {}> = {
  content?: string
  child?: JsonHtmlNodeTree<JsonTagElNode<Ext>>
  attributes?: Attributes
  tag: HtmlTags
} & Omit<Ext, 'content' | 'children' | 'attributes' | 'tag'>

export type JsonHtmlNodeTree<NodeT extends JsonTagElNode = JsonTagElNode> = {
  [id: string]: JsonTagElNode<NodeT>
}
