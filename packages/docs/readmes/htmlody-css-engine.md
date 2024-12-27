# HTMLody CSS Engine Module


## Background
Rarely would you every have to interact directly with this module, because HTMLody has a built in plugins that allows a nice abstraction. 

## Overview

The CSS Engine Module, inspired by Tailwind CSS, offers a dynamic and flexible approach to creating utility-first CSS rules in JavaScript applications. When used in conjunction with the HTMLody module, it forms a powerful templating system, enabling developers to efficiently style HTML templates with a Tailwind-like API. This module simplifies the process of generating responsive and customizable CSS classes, enhancing the development experience in web projects.

## Features

### Tailwind-Inspired API

- Emulates the utility-first design of Tailwind CSS, providing a familiar API for developers.
- Supports responsive design with customizable breakpoints and utility classes.

### Utility Class Generators

- **Fraction Percent Mapping**, **Spacing Helper**, **Sizing Helper**: Generate responsive layout utilities.
- **Color Utilities**: Functions for text, background, border, and shadow colors.
- **Advanced Styling**: Includes gap helpers, text and border color generators, and shadow size mapping.

### Responsive and Customizable

- Leverages fractional values and responsive breakpoints to create flexible layouts.
- Allows easy customization and extension to fit specific project needs.

## Usage with HTMLody

### Creating Responsive Layouts

```javascript
import { sizeFractions } from 'bnkit/htmlody/css-engine';

// Responsive half-width classes
const widthClasses = sizeFractions("1/2");
```

### Styling Text and Background

```javascript
import { textColorGen, bgColorGen } from 'bnkit/htmlody/css-engine';

// Text color utility classes
const textColorClasses = textColorGen("blue", 500);

// Background color utility classes
const bgColorClasses = bgColorGen("red", 500);
```
