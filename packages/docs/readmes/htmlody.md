# HTMLody Module

## Generate Static Or Dynamic Content with a Plugable JSON to HTML and CSS converter

## Build Dynamic Fully SSR'd Apps or Export Static Assets

1. **Dynamic HTML Generation**: Convert JSON structures into valid HTML strings.
2. **Tailwind-like CSS Class Utilities**: Optionally use the class records for styling or roll your own css!
3. **Use with anything**: Easily add htmx to the document to get HTMX superpowers.
4. **Flexible Configuration**: Define and customize HTML nodes, attributes, and content using a well-defined TypeScript schema.
5. **Export Static HTML Page**: Utilize the power of a server to offer a rich fullstack developer experience, or deliver a static HTML page to host with a provider of your choosing and have fantastic page loading performance.

Build simple dynamic apps like control panels very quickly.  

---
### Key Features

#### JSON Configuration for HTML Generation

The primary input to the system is a JSON configuration that defines the structure, content, and attributes of the HTML to be generated.

## Guide to Using JSON Format for HTML Site Construction with TypeScript

## Overview

This guide provides a comprehensive walkthrough on how to leverage a JSON-like structure for building HTML websites using TypeScript and the `Bun Nook Kit` library. This approach promotes a programmatic, reusable, and maintainable way of defining your website's structure, style, and content.

---

## Key Concepts and Types

### 1. Tag Attribute

The tag is the most basic yet fundemental part - configure your node to the HTML tag to render.

```typescript
import { CRNode, cc, CRNode, uClass } from "bnkit/htmlody";
 

const element: CRNode = {
  tag: "div",
  content: "Hello World!"
};
```

---
### 2. CR (Class References)

The function cc(class composition) - this is a utility that will take in an array of classNames very similar to Tailwind,however instead of using te class attribute or className for react you pass can call cc with your classes.

This gives you the option to

- Serve static webpages - assuming you don't need your server, just grab your generated HTML file and assets and host it anywhere that will allow you to host static assets!
- SSR a new HTML document on each request with only the css utility classes used! No need to even generate a seperate CSS file. This can be useful where you need very lightweight clients with dynamic data.
- Create microapps - since the generatedwebpages are so light weight you could drop them in as iframes into existing websites

```typescript

const element: CRNode = {
  tag: "div",
  cr: cc(["class1", "class2"])
};
```

---
### 3. Content

- (Optional) Represents the inner text of an HTML element.

```typescript
const element: CRNode = {
  tag: "p",
  content: "This is a paragraph."
};
```

---
### 4. Children

Represents nested HTML elements. Very similar to the way it is used in React

```typescript
const element: CRNode = {
  tag: "div",
  children: {
    // the key of the child just needs to be unique.
    child1: {
      tag: "p",
      content: "Child node paragraph."
    }
  }
};
```

---
### Reusability

Create reusable components for consistency and reduced duplication. Ensure the return type, is of the correct node type you are using. A CRNode is class record node (which is how cr is supported).

```typescript
import { CRNode } from "bnkit/htmlody";

const createButton = (label: string): CRNode => ({
  tag: "button",
  content: label,
  cr: cc(["btn", "btn-primary"])
});
```

---
### Build a Page

```typescript
const page: CRNode = {
  tag: "div",
  children: {
    headerId: {
      tag: "h1",
      content: "Welcome to My Site"
    },
    buttonId: createButton("Click Me")
  }
};
```

## Plugins

### Class Records Plugin - Responsive Styles

Define responsive styles with the `cr` property:

The cr key stands for "ClassRecords" this will accept an object of all the breakpoints ("*" is for all breakpoints), along with a record passed to the breakpoint config which is a key/value (string/boolean) of each class you want(true being applied). This approach allows you to easily SSR new pages based on changing data from a database. You'll notice the uClass(union class) utility function being used, this is used inside the break pionts instead of having to create a record of classes. Eventually it'll support just arrays, but I wanted to make sure to get the TypeScript correct.

```typescript
import { cc, CRNode, uClass } from "bnkit/htmlody";

const responsiveDiv: CRNode = {
  tag: "div",
  cr: {
    "*": uClass(["base-class"]),
    sm: uClass(["sm-class"]),
    md: uClass(["md-class"]),
    lg: {
      "conditional-class": true
    }
  }
};
```

---
### Markdown Plugin - Render Your Markdown Right In Your Json Config

The Markdown Plugin for HTMLody allows you to easily incorporate Markdown content within your JSON configuration, converting it to HTML during the rendering process. This enables you to write content in a more human-readable format while still generating structured HTML.

### Plugin Basic Example

```typescript
import { markdownPlugin, jsonToHtml } from "bnkit/htmlody";
import type { MDNode } from "bnkit/htmlody"

// MDNode = Markdown Node
const content: MDNode = {
  main: {
    tag: "div",
    markdown: "# Welcome to My Site\nThis is a *sample* paragraph."
  }
};

const html = jsonToHtml(content, [markdownPlugin]);
console.log(html);  // Output: <div><h1>Welcome to My Site</h1><p>This is a <em>sample</em> paragraph.</p></div>
```

---
## Using Markdown in Your JSON Configuration

### Basic Usage


Add a `markdown` attribute to any node in your JSON configuration:

```json
{
  "main": {
    "tag": "div",
    "markdown": "# Welcome\nThis is **bold** and this is *italic*."
  }
}
```

### Combining with Other Plugins

The Markdown Plugin can be used alongside other HTMLody plugins. Just ensure to add it to the plugins array:

```typescript

// HTML renderer
const output = jsonToHtml(input, [markdownPlugin, classRecordPlugin]);
```

While I will eventually add automatic type inference based on the plugins, it doesn't automatic do that so in order to create a combined node it would look like the following:

```typescript
type AppNode = MDNode & CRNode

export const htmlBody: JsonHtmlNodeMap<AppNode> = {
  h1: {
    content: "Hello World",
    attributes: {
      class: "bg-blue-500",
      id: "title-id",
    },

    tag: "h1",
  },
  p: { content: "This is a description", tag: "p" },
  a: {
    content: "Click Me",
    attributes: {
      href: "https://www.example.com",
    },
    tag: "a",
  },

  div_1: {
    tag: "div",
    attributes: {
      class: "bg-red-500",
    },
    
    children: {
      button_1: htmxButton,
      div_1: {
        tag: "div",
        content: "Hello World",
      },
    },
  },
};

```


## ![HTMLody Usage](usage/htmlody-usage.md)

## ![HTMLody CSS Engine Module](htmlody-css-engine)
## ![HTMLody Plugins](htmlody-plugins)