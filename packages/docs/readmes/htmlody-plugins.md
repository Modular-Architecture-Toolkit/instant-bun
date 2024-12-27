# HTMLody Plugins

## Overview

HTMLody Plugins and Types are integral parts of a system designed for dynamic HTML content generation and manipulation. This module, a key component of the larger HTMLody ecosystem, provides extensible plugins and type definitions that enrich HTML elements with additional functionalities like responsive class records and markdown processing.

## Features

### HTMLody Plugins

- **Class Record Plugin**: Enhances HTML elements with responsive class records, allowing for dynamic, breakpoint-specific styling.
- **Markdown Plugin**: Converts markdown content into HTML, enabling markdown to be seamlessly integrated into HTML elements.

### HTMLody Types

- **ClassRecord**: Defines boolean mappings for CSS utility classes.
- **ResponsiveClassRecord**: Manages responsive utility classes for different screen sizes (e.g., sm, md, lg, xl).
- **ExtensionRec**: Generic record type for extending HTML element attributes.
- **JsonTagElNode**: Type definition for HTML elements in the JSON format, accommodating extended attributes and content.

## Usage Examples

### Using the Class Record Plugin

```javascript
import { classRecordPlugin } from 'bnkit/htmlody/htmlody-plugins';

const responsiveElement = {
  tag: "div",
  cr: {
    sm: { "text-blue": true, "font-bold": false },
    md: { "text-green": true }
  }
};

const processedElement = classRecordPlugin.processNode(responsiveElement);
// The processedElement now contains responsive CSS class assignments
```

### Applying the Markdown Plugin

```javascript
import { markdownPlugin } from 'bnkit/htmlody/htmlody-plugins';

const markdownElement = {
  tag: "div",
  markdown: "# This is a header\nThis is a paragraph."
};

const htmlElement = markdownPlugin.processNode(markdownElement);
// htmlElement now contains converted HTML content from markdown
```

## Integration with HTMLody

These plugins and types are designed to be used with the HTMLody module, forming a comprehensive system for HTML and CSS templating. They enhance the functionality of HTMLody by adding the ability to handle class records and markdown within HTML elements.
