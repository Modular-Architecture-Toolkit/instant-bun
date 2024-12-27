import type { JsonHtmlNodeTree, JsonTagElNode } from '.'
import type { CRNode, MDNode } from './htmlody-plugins'
// import { pageFactory } from "./html-generator";

type AppNode = CRNode & MDNode

export const htmxButton: JsonTagElNode<AppNode> = {
  content: 'Click Me',
  attributes: {
    'hx-post': '/clicked',
    'hx-trigger': 'click',
    'hx-target': '#clicked',
    'hx-swap': 'outerHTML',
  },
  tag: 'button',
}

export const htmlBody: JsonHtmlNodeTree<AppNode> = {
  h1: {
    content: 'Hello World',
    attributes: {
      class: 'bg-blue-500',
      id: 'title-id',
    },

    tag: 'h1',
  },
  p: { content: 'This is a description', tag: 'p' },
  a: {
    content: 'Click Me',
    attributes: {
      href: 'https://www.example.com',
    },
    tag: 'a',
  },

  div_1: {
    tag: 'div',
    attributes: {
      class: 'bg-red-500',
    },

    child: {
      button_1: htmxButton,
      div_1: {
        tag: 'div',
        content: 'Hello World',
      },
    },
  },
}
