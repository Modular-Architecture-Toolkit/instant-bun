# HTMLody Usage Guide: Building HTML Pages with TypeScript

## Overview

HTMLody, part of the `Bun Nook Kit` library, offers a powerful and flexible way to generate HTML content using TypeScript. It allows you to define HTML elements, styles, and content programmatically, making it easier to build both dynamic and static web pages.

---

## Key Concepts

### 1. Basic Element Creation

To create a basic HTML element, define a `CRNode` and specify the tag and content:

```typescript
import { CRNode } from "bnkit/htmlody";

const element: CRNode = {
  tag: "div",
  content: "Hello World!"
};
```

### 2. Class References (CR)

Use `cc` (class composition) to add classes to an element. This is similar to Tailwind CSS but uses the `cr` property:

```typescript
const element: CRNode = {
  tag: "div",
  cr: cc(["class1", "class2"])
};
```

### 3. Nested Elements

You can nest HTML elements similar to JSX in React:

```typescript
const element: CRNode = {
  tag: "div",
  children: {
    child1: {
      tag: "p",
      content: "Child node paragraph."
    }
  }
};
```

### 4. Reusable Components

Create reusable components for consistency:

```typescript
const createButton = (label: string): CRNode => ({
  tag: "button",
  content: label,
  cr: cc(["btn", "btn-primary"])
});
```

### 5. Responsive Styles

Use the `cr` property to define responsive styles:

```typescript
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

### 6. Markdown Integration

Incorporate Markdown content within your JSON configuration:

```typescript
import { markdownPlugin, jsonToHtml } from "bnkit/htmlody";

const content: MDNode = {
  main: {
    tag: "div",
    markdown: "# Welcome to My Site\nThis is a *sample* paragraph."
  }
};

const html = jsonToHtml(content, [markdownPlugin]);
console.log(html);  // Outputs HTML string
```

### 7. Building a Full Page

Combine these concepts to build a full HTML page:

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

---

## Summary

HTMLody provides a flexible and powerful way to create HTML content using TypeScript. By leveraging its JSON-like configuration and class composition utilities, you can build dynamic, responsive, and reusable web components efficiently. Whether you're building fully SSR'd apps or exporting static assets, HTMLody simplifies the process, enhancing both the developer and end-user experience.
