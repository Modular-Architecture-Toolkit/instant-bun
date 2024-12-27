import type { ClassRecordAttributes } from './htmlody-plugins'
import type { ClassRecord, JsonHtmlNodeTree, JsonTagElNode, ResponsiveClassRecord } from './htmlody-types'

const fractionPercentMap = {
  '1/2': 50,
  '1/3': 33.333333,
  '2/3': 66.666667,
  '1/4': 25,
  '2/4': 50,
  '3/4': 75,
  '1/5': 20,
  '2/5': 40,
  '3/5': 60,
  '4/5': 80,
  '1/6': 16.666667,
  '2/6': 33.333333,
  '3/6': 50,
  '4/6': 66.666667,
  '5/6': 83.333333,
  '1/12': 8.333333,
  '2/12': 16.666667,
  '3/12': 25,
  '4/12': 33.333333,
  '5/12': 41.666667,
  '6/12': 50,
  '7/12': 58.333333,
  '8/12': 66.666667,
  '9/12': 75,
  '10/12': 83.333333,
  '11/12': 91.666667,
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const

type FractionPercentMapT = typeof fractionPercentMap

export type CSSUnits = 'rem' | 'px' | '%' | 'em'

export const cc = <Keys extends CSSMapKeys[]>(keys: Keys) => {
  const keyString = typeof keys === 'string' ? keys : keys.join(' ')
  const composition = {
    '*': {
      [keyString]: true,
    },
  }

  return composition
}

export const uClass = (keys: CSSMapKeys[]) => {
  // type casted so the resulting string doesn't throw a type error,
  // and keys are validated on the input
  return keys.join(' ') as 'u-class'
}

export const textAlign = <Val extends string>(val: Val) => `text-align: ${val};` as const
export const fontSize = <Val extends string>(val: Val) => `font-size: ${val};` as const
export const textColor = <Val extends string>(val: Val) => `color: ${val};` as const
export const bgColor = <Val extends string>(val: Val) => `background-color: ${val};` as const

export const border = <W extends string, S extends string, C extends string>(
  width: string,
  style: string,
  color: string
) => `border: ${width} ${style} ${color};` as const

function extractClassNames(classRecord: ClassRecord): string[] {
  return Object.entries(classRecord)
    .filter(([_key, value]) => value)
    .flatMap(([key]) => key.split(' '))
}

function generateCssSelector(breakpoint: string, className: string): string {
  const fullClassName = breakpoint === '*' ? className : `${breakpoint}_${className}`
  const cssRule = CSS_MAP[className]

  if (breakpoint === '*') {
    return `.${fullClassName} { ${cssRule} }`
  }
  return `@media (min-width: ${breakpoints[breakpoint]}) { .${fullClassName} { ${cssRule} } }`
}

function processClassRecords(classRecords: ResponsiveClassRecord, usedClasses: Set<string>): string | null {
  let cssStr = ''

  for (const [breakpoint, classRecord] of Object.entries(classRecords)) {
    const classNames = extractClassNames(classRecord)

    for (const className of classNames) {
      const fullClassName = breakpoint === '*' ? className : `${breakpoint}_${className}`

      if (!usedClasses.has(fullClassName)) {
        usedClasses.add(fullClassName)

        if (typeof CSS_MAP[className] === 'string') {
          const selector = generateCssSelector(breakpoint, className)
          cssStr += `${selector}\n`
        }
      }
    }
  }

  if (!cssStr) return null
  return cssStr
}

export function processNode(node: JsonTagElNode<ClassRecordAttributes>, usedClasses: Set<string>): string | null {
  let cssStr = ''

  if (node.cr) {
    const classRecords = processClassRecords(node.cr, usedClasses)
    if (classRecords) cssStr += classRecords
  }

  if (node.child) {
    for (const childNode of Object.values(node.child)) {
      const childNodeStr = processNode(childNode, usedClasses)
      if (childNodeStr) cssStr += childNodeStr
    }
  }

  return cssStr || null
}

export function generateCSS<
  NodeMap extends JsonHtmlNodeTree<JsonTagElNode<ClassRecordAttributes>> = JsonHtmlNodeTree<
    JsonTagElNode<ClassRecordAttributes>
  >,
>(nodeMap: NodeMap): string | null {
  const usedClasses = new Set<string>()
  let cssStr = ''

  for (const node of Object.values(nodeMap)) {
    const nodeStr = processNode(node, usedClasses)
    if (nodeStr) cssStr += nodeStr
  }

  if (!cssStr) return null
  return cssStr
}

export const createKeyVal = <Key extends string, Val extends string>(key: Key, val: Val) => {
  const obj = {
    [key]: val,
  } as {
    [K in Key]: Val
  }

  return obj
}

export const cssPropertyValueGen = <
  ClassAbbrevKey extends string,
  Property extends string,
  Value extends number | string,
  Unit extends string,
>(
  classAbbrevKey: ClassAbbrevKey,
  property: Property,
  value: Value,
  unit: Unit
) => {
  const cssGen = `${property}: ${value}${unit};` as const

  return {
    [classAbbrevKey]: cssGen,
  } as {
    [K in ClassAbbrevKey]: typeof cssGen
  }
}

export const sizingHelper = <ClassValKey extends number, Value extends number | string, Unit extends CSSUnits>(
  classValKey: ClassValKey,
  value: Value,
  unit: Unit
) => {
  return {
    ...cssPropertyValueGen(`w-${classValKey}`, 'width', value, unit),
    ...cssPropertyValueGen(`h-${classValKey}`, 'height', value, unit),
  } as const
}

const fractionHelper = <
  ClassAbbrevKey extends string,
  Fraction extends keyof FractionPercentMapT,
  Property extends string,
>(
  classAbbrevKey: ClassAbbrevKey,
  fraction: Fraction,
  property: Property
) => {
  const percentageValue = fractionPercentMap[fraction]

  return cssPropertyValueGen(`${classAbbrevKey}-${fraction}`, property, percentageValue, '%')
}

export const sizeFractions = <Fraction extends keyof FractionPercentMapT>(fraction: Fraction) => {
  return {
    ...fractionHelper('w', fraction, 'width'),
    ...fractionHelper('h', fraction, 'height'),
  }
}

export const spacingHelper = <ClassAbbrevKey extends number, Val extends number, Unit extends CSSUnits>(
  marginFactorKey: ClassAbbrevKey,
  value: Val,
  unit: Unit
) => {
  return {
    ...createKeyVal(`m-${marginFactorKey}`, `margin: ${value}${unit};`),
    ...createKeyVal(`mt-${marginFactorKey}`, `margin-top: ${value}${unit};`),
    ...createKeyVal(`mb-${marginFactorKey}`, `margin-bottom: ${value}${unit};`),
    ...createKeyVal(`ml-${marginFactorKey}`, `margin-left: ${value}${unit};`),
    ...createKeyVal(`mr-${marginFactorKey}`, `margin-right: ${value}${unit};`),
    ...createKeyVal(`mx-${marginFactorKey}`, `margin-left: ${value}${unit}; margin-right: ${value}${unit};`),
    ...createKeyVal(`my-${marginFactorKey}`, `margin-top: ${value}${unit}; margin-bottom: ${value}${unit};`),

    ...createKeyVal(`p-${marginFactorKey}`, `padding: ${value}${unit};`),
    ...createKeyVal(`pt-${marginFactorKey}`, `padding-top: ${value}${unit};`),
    ...createKeyVal(`pb-${marginFactorKey}`, `padding-bottom: ${value}${unit};`),
    ...createKeyVal(`pl-${marginFactorKey}`, `padding-left: ${value}${unit};`),
    ...createKeyVal(`pr-${marginFactorKey}`, `padding-right: ${value}${unit};`),
    ...createKeyVal(`px-${marginFactorKey}`, `padding-left: ${value}${unit}; padding-right: ${value}${unit};`),
    ...createKeyVal(`py-${marginFactorKey}`, `padding-top: ${value}${unit}; padding-bottom: ${value}${unit};`),
  } as const
}

export type ColorShades = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type ColorMap = {
  [Key in ColorType]: {
    [Key in ColorShades]: string
  }
}

export const baseColors = {
  red: '#ff0000',
  orange: '#ffa500',
  yellow: '#ffff00',
  green: '#0f0000',
  blue: '#0000ff',
  indigo: '#4b0082',
  purple: '#800080',
  pink: '#ffc0cb',
  slate: '#708090',
  gray: '#808080',
  lightgray: '#d3d3d3',
  powderblue: '#b0e0e6',
  whitesmoke: '#f5f5f5',
} as const

export type ColorType = keyof typeof baseColors

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

export function adjustBrightness(
  color: { r: number; g: number; b: number },
  factor: number
): { r: number; g: number; b: number } {
  return {
    r: Math.round(clamp(color.r * factor, 0, 255)),
    g: Math.round(clamp(color.g * factor, 0, 255)),
    b: Math.round(clamp(color.b * factor, 0, 255)),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
export function generateShades(color: ColorType): string[] {
  const hex = baseColors[color]
  const baseColor = hexToRgb(hex)
  if (!baseColor) throw new Error('Invalid color format')

  const shades: string[] = []
  // Factors less than 1 will darken the color,
  // 1 will leave it unchanged,
  // and greater than 1 will lighten it
  const factors = [0.1, 0.3, 0.5, 0.7, 0.9, 1, 1.1, 1.3, 1.5, 1.7]
  factors.forEach((factor, index) => {
    let adjustedColor: ReturnType<typeof adjustBrightness> | ReturnType<typeof lightenColor>

    if (index < 5) {
      // Darken the color for shades 50-400
      adjustedColor = adjustBrightness(baseColor, factor)
    } else {
      // Lighten the color for shades 600-900
      adjustedColor = lightenColor(baseColor, factor)
    }
    const shade = rgbToHex(adjustedColor.r, adjustedColor.g, adjustedColor.b)
    shades.push(shade)
  })

  return shades
}

function lightenColor(color: { r: number; g: number; b: number }, factor: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(clamp(color.r + (255 - color.r) * (factor - 1), 0, 255)),
    g: Math.round(clamp(color.g + (255 - color.g) * (factor - 1), 0, 255)),
    b: Math.round(clamp(color.b + (255 - color.b) * (factor - 1), 0, 255)),
  }
}

export const generateVariablesForColor = <Color extends ColorType>(color: Color) => {
  const cssVariables: string[] = []

  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

  const shadeColorArray = generateShades(color)

  for (let i = 0; i < shades.length; i++) {
    const shade = shades[i]
    const colorCode = shadeColorArray[i]

    cssVariables.push(`--${color}-${shade}: ${colorCode};\n`)
  }

  return cssVariables.join('')
}

export const generateColorVariables = () => {
  let cssVariables = ':root {\n'

  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'purple',
    'pink',
    'slate',
    'gray',
    'lightgray',
    'powderblue',
    'whitesmoke',
  ] as const

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i]
    const typedColor = color
    cssVariables += generateVariablesForColor(typedColor)
  }

  cssVariables += '}\n'
  return cssVariables
}

export const textColorGen = <Color extends string, Shade extends ColorShades>(color: Color, shade: Shade) => {
  return cssPropertyValueGen(`text-${color}-${shade}`, 'color', `var(--${color}-${shade})`, '')
}

export const bgColorGen = <Color extends string, Shade extends ColorShades>(color: Color, shade: Shade) => {
  return cssPropertyValueGen(`bg-${color}-${shade}`, 'background-color', `var(--${color}-${shade})`, '')
}

export const borderColorGen = <Color extends string, Shade extends ColorShades>(color: Color, shade: Shade) => {
  return cssPropertyValueGen(`border-${color}-${shade}`, 'border-color', `var(--${color}-${shade})`, '')
}

export const textColorStrokeGen = <Color extends string, Shade extends ColorShades>(color: Color, shade: Shade) => {
  return cssPropertyValueGen(
    `text-stroke-${color}-${shade}`,
    '-webkit-text-stroke-color',
    `var(--${color}-${shade})`,
    ''
  )
}

const shadowSizes = {
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'shadow-inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'shadow-none': '0 0 #0000',
} as const

type ShadowSize = keyof typeof shadowSizes

export const shadowGen = <Size extends ShadowSize>(size: Size) => {
  const shadowValue = shadowSizes[size]
  return cssPropertyValueGen(size, 'box-shadow', shadowValue, '')
}

export const generatePropertiesForColor = <Color extends ColorType>(colorKey: Color) => {
  return {
    ...textColorGen(colorKey, 50),
    ...textColorGen(colorKey, 100),
    ...textColorGen(colorKey, 200),
    ...textColorGen(colorKey, 300),
    ...textColorGen(colorKey, 400),
    ...textColorGen(colorKey, 500),
    ...textColorGen(colorKey, 600),
    ...textColorGen(colorKey, 700),
    ...textColorGen(colorKey, 800),
    ...textColorGen(colorKey, 900),
    ...bgColorGen(colorKey, 50),
    ...bgColorGen(colorKey, 100),
    ...bgColorGen(colorKey, 200),
    ...bgColorGen(colorKey, 300),
    ...bgColorGen(colorKey, 400),
    ...bgColorGen(colorKey, 500),
    ...bgColorGen(colorKey, 600),
    ...bgColorGen(colorKey, 700),
    ...bgColorGen(colorKey, 800),
    ...bgColorGen(colorKey, 900),
    ...borderColorGen(colorKey, 50),
    ...borderColorGen(colorKey, 100),
    ...borderColorGen(colorKey, 200),
    ...borderColorGen(colorKey, 300),
    ...borderColorGen(colorKey, 400),
    ...borderColorGen(colorKey, 500),
    ...borderColorGen(colorKey, 600),
    ...borderColorGen(colorKey, 700),
    ...borderColorGen(colorKey, 800),
    ...borderColorGen(colorKey, 900),
    ...textColorStrokeGen(colorKey, 50),
    ...textColorStrokeGen(colorKey, 100),
    ...textColorStrokeGen(colorKey, 200),
    ...textColorStrokeGen(colorKey, 300),
    ...textColorStrokeGen(colorKey, 400),
    ...textColorStrokeGen(colorKey, 500),
    ...textColorStrokeGen(colorKey, 600),
    ...textColorStrokeGen(colorKey, 700),
    ...textColorStrokeGen(colorKey, 800),
    ...textColorStrokeGen(colorKey, 900),
  }
}

// gaps are based on rem by default
const baseGapSizes = {
  '0': '0',
  '0.5': '0.125', // 2px
  '1': '0.25', // 4px
  '1.5': '0.375', // 6px
  '2': '0.5', // 8px
  '2.5': '0.625', // 10px
  '3': '0.75', // 12px
  '3.5': '0.875', // 14px
  '4': '1', // 16px
  '5': '1.25', // 20px
  '6': '1.5', // 24px
  '7': '1.75', // 28px
  '8': '2', // 32px
  '9': '2.25', // 36px
  '10': '2.5', // 40px
  '11': '2.75', // 44px
  '12': '3', // 48px
  '14': '3.5', // 56px
  '16': '4', // 64px
  '20': '5', // 80px
  '24': '6', // 96px
  '28': '7', // 112px
  '32': '8', // 128px
  '36': '9', // 144px
  '40': '10', // 160px
  '44': '11', // 176px
  '48': '12', // 192px
  '52': '13', // 208px
  '56': '14', // 224px
  '60': '15', // 240px
  '64': '16', // 256px
  '72': '18', // 288px
  '80': '20', // 320px
  '96': '24', // 384px
} as const

type GapSize = keyof typeof baseGapSizes

const gapHelper = <Key extends GapSize>(key: Key) => cssPropertyValueGen(key, 'gap', baseGapSizes[key], 'rem')

export const generateGapHelper = <Gap extends GapSize, Unit extends CSSUnits = 'rem'>(gap: Gap, unit: Unit) => {
  const gapValue = baseGapSizes[gap]

  const baseGap = `gap-${gap}` as const
  const xGap = `gap-x-${gap}` as const
  const yGap = `gap-y-${gap}` as const

  return {
    ...cssPropertyValueGen(baseGap, 'gap', gapValue, unit),
    ...cssPropertyValueGen(xGap, 'column-gap', gapValue, unit),
    ...cssPropertyValueGen(yGap, 'row-gap', gapValue, unit),
  }

  // return {
  //   [baseGap]: `gap: ${gapValue}${unit};`,
  //   [yGap]: `row-gap: ${gapValue}${unit};`,
  //   [xGap]: `column-gap: ${gapValue}${unit};`,
  // } as {
  //   [typeof baseGap]: typeof base1[typeof baseGap];

  // };
}

export const CSS_MAP = {
  ...spacingHelper(0.5, 0.125, 'rem'),
  ...spacingHelper(1, 0.25, 'rem'),
  ...spacingHelper(1.5, 0.375, 'rem'),
  ...spacingHelper(2, 0.5, 'rem'),
  ...spacingHelper(2.5, 0.625, 'rem'),
  ...spacingHelper(3, 0.75, 'rem'),
  ...spacingHelper(3.5, 0.875, 'rem'),
  ...spacingHelper(4, 1, 'rem'),
  ...spacingHelper(5, 1.25, 'rem'),
  ...spacingHelper(6, 1.5, 'rem'),
  ...spacingHelper(7, 1.75, 'rem'),
  ...spacingHelper(8, 2, 'rem'),
  ...spacingHelper(9, 2.25, 'rem'),
  ...spacingHelper(10, 2.5, 'rem'),
  ...spacingHelper(11, 2.75, 'rem'),
  ...spacingHelper(12, 3, 'rem'),
  ...spacingHelper(14, 3.5, 'rem'),
  ...spacingHelper(16, 4, 'rem'),
  ...spacingHelper(20, 5, 'rem'),
  ...spacingHelper(24, 6, 'rem'),
  ...spacingHelper(28, 7, 'rem'),
  ...spacingHelper(32, 8, 'rem'),
  ...spacingHelper(36, 9, 'rem'),
  ...spacingHelper(40, 10, 'rem'),
  ...spacingHelper(44, 11, 'rem'),
  ...spacingHelper(48, 12, 'rem'),
  ...spacingHelper(52, 13, 'rem'),
  ...spacingHelper(56, 14, 'rem'),
  ...spacingHelper(60, 15, 'rem'),
  ...spacingHelper(64, 16, 'rem'),
  ...spacingHelper(72, 18, 'rem'),
  ...spacingHelper(80, 20, 'rem'),
  ...spacingHelper(96, 24, 'rem'),
  ...sizingHelper(0.5, 0.125, 'rem'),
  ...sizingHelper(1, 0.25, 'rem'),
  ...sizingHelper(1.5, 0.375, 'rem'),
  ...sizingHelper(2, 0.5, 'rem'),
  ...sizingHelper(2.5, 0.625, 'rem'),
  ...sizingHelper(3, 0.75, 'rem'),
  ...sizingHelper(3.5, 0.875, 'rem'),
  ...sizingHelper(4, 1, 'rem'),
  ...sizingHelper(5, 1.25, 'rem'),
  ...sizingHelper(6, 1.5, 'rem'),
  ...sizingHelper(7, 1.75, 'rem'),
  ...sizingHelper(8, 2, 'rem'),
  ...sizingHelper(9, 2.25, 'rem'),
  ...sizingHelper(10, 2.5, 'rem'),
  ...sizingHelper(11, 2.75, 'rem'),
  ...sizingHelper(12, 3, 'rem'),
  ...sizingHelper(14, 3.5, 'rem'),
  ...sizingHelper(16, 4, 'rem'),
  ...sizingHelper(20, 5, 'rem'),
  ...sizingHelper(24, 6, 'rem'),
  ...sizingHelper(28, 7, 'rem'),
  ...sizingHelper(32, 8, 'rem'),
  ...sizingHelper(36, 9, 'rem'),
  ...sizingHelper(40, 10, 'rem'),
  ...sizingHelper(44, 11, 'rem'),
  ...sizingHelper(48, 12, 'rem'),
  ...sizingHelper(52, 13, 'rem'),
  ...sizingHelper(56, 14, 'rem'),
  ...sizingHelper(60, 15, 'rem'),
  ...sizingHelper(64, 16, 'rem'),
  ...sizingHelper(72, 18, 'rem'),
  ...sizingHelper(80, 20, 'rem'),
  ...sizingHelper(96, 24, 'rem'),
  ...sizeFractions('1/2'),
  ...sizeFractions('1/3'),
  ...sizeFractions('2/3'),
  ...sizeFractions('1/4'),
  ...sizeFractions('2/4'),
  ...sizeFractions('3/4'),
  ...sizeFractions('1/5'),
  ...sizeFractions('2/5'),
  ...sizeFractions('3/5'),
  ...sizeFractions('4/5'),
  ...sizeFractions('1/6'),
  ...sizeFractions('2/6'),
  ...sizeFractions('3/6'),
  ...sizeFractions('4/6'),
  ...sizeFractions('5/6'),
  ...sizeFractions('1/12'),
  ...sizeFractions('2/12'),
  ...sizeFractions('3/12'),
  ...sizeFractions('4/12'),
  ...sizeFractions('5/12'),
  ...sizeFractions('6/12'),
  ...sizeFractions('7/12'),
  ...sizeFractions('8/12'),
  ...sizeFractions('9/12'),
  ...sizeFractions('10/12'),
  ...sizeFractions('11/12'),
  ...generatePropertiesForColor('red'),
  ...generatePropertiesForColor('orange'),
  ...generatePropertiesForColor('yellow'),
  ...generatePropertiesForColor('green'),
  ...generatePropertiesForColor('blue'),
  ...generatePropertiesForColor('indigo'),
  ...generatePropertiesForColor('purple'),
  ...generatePropertiesForColor('pink'),
  ...generatePropertiesForColor('slate'),
  ...generatePropertiesForColor('gray'),
  ...generatePropertiesForColor('lightgray'),
  ...generatePropertiesForColor('powderblue'),
  ...generatePropertiesForColor('whitesmoke'),
  'text-stroke-black': '-webkit-text-stroke-color: black;',
  'text-stroke-white': '-webkit-text-stroke-color: white;',
  'w-full': 'width: 100%;',
  'h-full': 'height: 100%;',
  'w-screen': 'width: 100vw;',
  'h-screen': 'height: 100vh;',
  'w-min': 'width: min-content;',
  'h-min': 'height: min-content;',
  'w-max': 'width: max-content;',
  'h-max': 'height: max-content;',
  'w-fit': 'width: fit-content;',
  'h-fit': 'height: fit-content;',
  'w-auto': 'width: auto;',
  'h-auto': 'height: auto;',
  'w-px': 'width: 1px;',
  'h-px': 'height: 1px;',
  'w-0': 'width: 0;',
  'h-0': 'height: 0;',
  '100vh': 'height: 100vh;',
  'min-h-screen': 'min-height: 100vh;',
  'min-w-screen': 'min-width: 100vw;',
  'min-h-0': 'min-height: 0;',
  'min-w-0': 'min-width: 0;',
  'min-h-full': 'min-height: 100%;',
  'min-w-full': 'min-width: 100%;',

  // Display
  block: 'display: block;',
  inline: 'display: inline;',
  'inline-block': 'display: inline-block;',
  grid: 'display: grid;',
  'inline-grid': 'display: inline-grid;',
  hidden: 'display: none;',
  contents: 'display: contents;',
  table: 'display: table;',
  'table-caption': 'display: table-caption;',
  'table-cell': 'display: table-cell;',
  'table-column': 'display: table-column;',
  'table-column-group': 'display: table-column-group;',
  'table-footer-group': 'display: table-footer-group;',
  'table-header-group': 'display: table-header-group;',
  'table-row-group': 'display: table-row-group;',
  'table-row': 'display: table-row;',
  'flow-root': 'display: flow-root;',
  'inline-table': 'display: inline-table;',
  'list-item': 'display: list-item;',
  'list-item-block': 'display: list-item-block;',
  'list-item-inline': 'display: list-item-inline;',
  'list-item-inline-block': 'display: list-item-inline-block;',

  // position
  sticky: 'position: sticky;',
  static: 'position: static;',
  fixed: 'position: fixed;',
  absolute: 'position: absolute;',
  relative: 'position: relative;',
  'inset-0': 'top: 0; right: 0; bottom: 0; left: 0;',
  'inset-y-0': 'top: 0; bottom: 0;',
  'inset-x-0': 'right: 0; left: 0;',
  'inset-y-auto': 'top: auto; bottom: auto;',
  'inset-x-auto': 'right: auto; left: auto;',
  'top-0': 'top: 0;',
  'right-0': 'right: 0;',
  'bottom-0': 'bottom: 0;',
  'left-0': 'left: 0;',
  'top-auto': 'top: auto;',
  'right-auto': 'right: auto;',
  'bottom-auto': 'bottom: auto;',
  'left-auto': 'left: auto;',

  // Flexbox Utilities
  flex: 'display: flex;',
  'inline-flex': 'display: inline-flex;',
  'flex-row': 'flex-direction: row;',
  'flex-row-reverse': 'flex-direction: row-reverse;',
  'flex-col': 'flex-direction: column;',
  'flex-col-reverse': 'flex-direction: column-reverse;',
  'flex-grow': 'flex-grow: 1;',

  'items-start': 'align-items: flex-start;',
  'items-center': 'align-items: center;',
  'items-end': 'align-items: flex-end;',
  'items-stretch': 'align-items: stretch;',
  'items-baseline': 'align-items: baseline;',
  'items-auto': 'align-items: auto;',
  'items-normal': 'align-items: normal;',

  'justify-start': 'justify-content: flex-start;',
  'justify-center': 'justify-content: center;',
  'justify-end': 'justify-content: flex-end;',
  'justify-between': 'justify-content: space-between;',
  'justify-around': 'justify-content: space-around;',
  'justify-evenly': 'justify-content: space-evenly;',

  'justify-items-start': 'justify-items: flex-start;',
  'justify-items-center': 'justify-items: center;',
  'justify-items-end': 'justify-items: flex-end;',
  'justify-items-stretch': 'justify-items: stretch;',
  'justify-items-baseline': 'justify-items: baseline;',
  'justify-items-auto': 'justify-items: auto;',

  'justify-self-auto': 'justify-self: auto;',
  'justify-self-start': 'justify-self: flex-start;',
  'justify-self-center': 'justify-self: center;',
  'justify-self-end': 'justify-self: flex-end;',
  'justify-self-stretch': 'justify-self: stretch;',
  'justify-self-baseline': 'justify-self: baseline;',
  'justify-self-normal': 'justify-self: normal;',
  'justify-self-left': 'justify-self: left;',
  'justify-self-right': 'justify-self: right;',
  'justify-self-safe': 'justify-self: safe;',
  'justify-self-unsafe': 'justify-self: unsafe;',

  // Grid Utilities
  'grid-cols-1': 'grid-template-columns: repeat(1, minmax(0, 1fr));',
  'grid-cols-2': 'grid-template-columns: repeat(2, minmax(0, 1fr));',
  'grid-cols-3': 'grid-template-columns: repeat(3, minmax(0, 1fr));',
  'grid-cols-4': 'grid-template-columns: repeat(4, minmax(0, 1fr));',
  'grid-cols-5': 'grid-template-columns: repeat(5, minmax(0, 1fr));',
  'grid-cols-6': 'grid-template-columns: repeat(6, minmax(0, 1fr));',
  'grid-cols-7': 'grid-template-columns: repeat(7, minmax(0, 1fr));',
  'grid-cols-8': 'grid-template-columns: repeat(8, minmax(0, 1fr));',
  'grid-cols-9': 'grid-template-columns: repeat(9, minmax(0, 1fr));',
  'grid-cols-10': 'grid-template-columns: repeat(10, minmax(0, 1fr));',
  'grid-cols-11': 'grid-template-columns: repeat(11, minmax(0, 1fr));',
  'grid-cols-12': 'grid-template-columns: repeat(12, minmax(0, 1fr));',

  // Text Utilities
  'text-left': textAlign('left'),
  'text-center': textAlign('center'),
  'text-right': textAlign('right'),
  'text-xs': fontSize('0.75rem'),
  'text-sm': fontSize('0.875rem'),
  'text-base': fontSize('1rem'),
  'text-lg': fontSize('1.125rem'),
  'text-xl': fontSize('1.25rem'),
  'text-2xl': fontSize('1.5rem'),
  'text-3xl': fontSize('1.875rem'),
  'text-4xl': fontSize('2.25rem'),

  italic: 'font-style: italic;',
  underline: 'text-decoration: underline;',
  'line-through': 'text-decoration: line-through;',
  'no-underline': 'text-decoration: none;',
  uppercase: 'text-transform: uppercase;',
  lowercase: 'text-transform: lowercase;',
  capitalize: 'text-transform: capitalize;',
  'normal-case': 'text-transform: none;',

  //text stroke
  'text-stroke-1': '-webkit-text-stroke: 1px;',
  'text-stroke-2': '-webkit-text-stroke: 2px;',
  'text-stroke-3': '-webkit-text-stroke: 3px;',

  'text-white': textColor('white'),
  'text-black': textColor('black'),

  'bg-white': bgColor('white'),
  'bg-black': bgColor('black'),

  // Font Weight Utilities
  'font-thin': 'font-weight: 100;',
  'font-extralight': 'font-weight: 200;',
  'font-light': 'font-weight: 300;',
  'font-normal': 'font-weight: 400;',
  'font-medium': 'font-weight: 500;',
  'font-semibold': 'font-weight: 600;',
  'font-bold': 'font-weight: 700;',
  'font-extrabold': 'font-weight: 800;',

  // Border Utilities
  border: border('1px', 'solid', 'black'),
  'border-t': 'border-top: 1px solid;',

  ...shadowGen('shadow-sm'),
  ...shadowGen('shadow'),
  ...shadowGen('shadow-md'),
  ...shadowGen('shadow-lg'),
  ...shadowGen('shadow-xl'),
  ...shadowGen('shadow-2xl'),
  ...shadowGen('shadow-inner'),
  ...shadowGen('shadow-none'),

  // Gap Utilities
  ...generateGapHelper('0', 'px'),
  ...generateGapHelper('0.5', 'rem'),
  ...generateGapHelper('1', 'rem'),
  ...generateGapHelper('1.5', 'rem'),
  ...generateGapHelper('2', 'rem'),
  ...generateGapHelper('2.5', 'rem'),
  ...generateGapHelper('3', 'rem'),
  ...generateGapHelper('3.5', 'rem'),
  ...generateGapHelper('4', 'rem'),
  ...generateGapHelper('5', 'rem'),
  ...generateGapHelper('6', 'rem'),
  ...generateGapHelper('7', 'rem'),
  ...generateGapHelper('8', 'rem'),
  ...generateGapHelper('9', 'rem'),
  ...generateGapHelper('10', 'rem'),
  ...generateGapHelper('11', 'rem'),
  ...generateGapHelper('12', 'rem'),
  ...generateGapHelper('14', 'rem'),
  ...generateGapHelper('16', 'rem'),
  ...generateGapHelper('20', 'rem'),
  ...generateGapHelper('24', 'rem'),
  ...generateGapHelper('28', 'rem'),
  ...generateGapHelper('32', 'rem'),
  ...generateGapHelper('36', 'rem'),
  ...generateGapHelper('40', 'rem'),
  ...generateGapHelper('44', 'rem'),
  ...generateGapHelper('48', 'rem'),
  ...generateGapHelper('52', 'rem'),
  ...generateGapHelper('56', 'rem'),
  ...generateGapHelper('60', 'rem'),
  ...generateGapHelper('64', 'rem'),
  ...generateGapHelper('72', 'rem'),
  ...generateGapHelper('80', 'rem'),
  ...generateGapHelper('96', 'rem'),

  // border radius
  'rounded-none': 'border-radius: 0;',
  'rounded-sm': 'border-radius: 0.125rem;',
  rounded: 'border-radius: 0.25rem;',
  'rounded-md': 'border-radius: 0.375rem;',
  'rounded-lg': 'border-radius: 0.5rem;',
  'rounded-xl': 'border-radius: 0.75rem;',
  'rounded-2xl': 'border-radius: 1rem;',
  'rounded-3xl': 'border-radius: 1.5rem;',
  'rounded-full': 'border-radius: 9999px;',
  'rounded-t-none': 'border-top-left-radius: 0; border-top-right-radius: 0;',
  'rounded-r-none': 'border-top-right-radius: 0; border-bottom-right-radius: 0;',
  'rounded-b-none': 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;',
  'rounded-l-none': 'border-top-left-radius: 0; border-bottom-left-radius: 0;',
  'rounded-t-sm': 'border-top-left-radius: 0.125rem; border-top-right-radius: 0.125rem;',
  'rounded-r-sm': 'border-top-right-radius: 0.125rem; border-bottom-right-radius: 0.125rem;',
  // TODO: create function to generate all variations
  'rounded-b-sm': 'border-bottom-right-radius: 0.125rem; border-bottom-left-radius: 0.125rem;',

  // max width and height
  'max-w-none': 'max-width: none;',
  'max-w-xs': 'max-width: 20rem;',
  'max-w-sm': 'max-width: 24rem;',
  'max-w-md': 'max-width: 28rem;',
  'max-w-lg': 'max-width: 32rem;',
  'max-w-xl': 'max-width: 36rem;',
  'max-w-2xl': 'max-width: 42rem;',
  'max-w-3xl': 'max-width: 48rem;',
  'max-w-4xl': 'max-width: 56rem;',
  'max-w-5xl': 'max-width: 64rem;',
  'max-w-6xl': 'max-width: 72rem;',
  'max-w-7xl': 'max-width: 80rem;',
  'max-w-full': 'max-width: 100%;',

  'max-h-none': 'max-height: none;',
  'max-h-xs': 'max-height: 20rem;',
  'max-h-sm': 'max-height: 24rem;',
  'max-h-md': 'max-height: 28rem;',
  'max-h-lg': 'max-height: 32rem;',
  'max-h-xl': 'max-height: 36rem;',
  'max-h-2xl': 'max-height: 42rem;',
  'max-h-3xl': 'max-height: 48rem;',
  'max-h-4xl': 'max-height: 56rem;',
  'max-h-5xl': 'max-height: 64rem;',
  'max-h-6xl': 'max-height: 72rem;',
  'max-h-7xl': 'max-height: 80rem;',
  'max-h-full': 'max-height: 100%;',

  // to support the return type of uClass function`
  'u-class': '',
} as const

export type CSSMapKeys = keyof typeof CSS_MAP
