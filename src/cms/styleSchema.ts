/**
 * MindSparQ Education & Technology
 * Style Overrides & Visual Customizer Schema
 * 
 * Provides type definitions, strict input validation, and CSS rule generation
 * for element-level and section-level manual design overrides.
 */

export interface ElementStyle {
  // Colors
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImageUrl?: string;
  overlayOpacity?: number; // 0 to 1
  textColor?: string;
  headingColor?: string;
  subheadingColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  iconColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonHoverBgColor?: string;
  buttonHoverTextColor?: string;
  cardBgColor?: string;
  cardHoverBgColor?: string;
  cardBorderColor?: string;
  cardShadow?: string;

  // Spacing (4 sides)
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Dimensions
  width?: string;
  maxWidth?: string;
  minWidth?: string;
  height?: string;
  maxHeight?: string;
  minHeight?: string;
  aspectRatio?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Gap & Layout
  display?: 'block' | 'flex' | 'grid' | 'inline-flex' | 'none';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  rowGap?: string;
  columnGap?: string;
  gridTemplateColumns?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';

  // Borders & Shadows
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: string;
  boxShadow?: string;

  // Scoped Custom CSS Variables
  customVariables?: Record<string, string>;
}

export interface ResponsiveStyleOverride {
  base?: ElementStyle;
  tablet?: ElementStyle; // viewport <= 768px
  mobile?: ElementStyle; // viewport <= 480px
}

export type StyleOverridesMap = Record<string, ResponsiveStyleOverride>;

/**
 * Validates a color value (Hex, RGB/A, HSL/A, CSS variable, transparent, named)
 */
export function isValidColor(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'transparent' || trimmed === 'currentcolor' || trimmed === 'inherit') return true;
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed)) return true;
  if (/^rgba?\(\s*[\d.%\s,/-]+\)$/i.test(trimmed)) return true;
  if (/^hsla?\(\s*[\d.%\s,/-]+\)$/i.test(trimmed)) return true;
  if (/^var\(--[a-z0-9_-]+\)$/i.test(trimmed)) return true;
  return false;
}

/**
 * Validates CSS length or percentage (px, rem, em, %, vw, vh, auto, clamp, calc)
 */
export function isValidLength(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (['0', 'auto', 'none', 'inherit', 'initial'].includes(trimmed.toLowerCase())) return true;
  if (/^-?(\d+(\.\d+)?)(px|rem|em|%|vw|vh|vmin|vmax|ch|ex)$/i.test(trimmed)) return true;
  if (/^var\(--[a-z0-9_-]+(\s*,\s*[^)]+)?\)$/i.test(trimmed)) return true;
  if (/^(calc|clamp|min|max)\([a-zA-Z0-9\s.,_%()+-]+\)$/i.test(trimmed)) return true;
  return false;
}

/**
 * Sanitize dangerous characters from CSS property values to prevent injection
 */
export function sanitizeStyleValue(val: string): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/[;{}<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/url\(\s*['"]?data:/gi, 'url(')
    .trim();
}

/**
 * Validates and sanitizes an ElementStyle object
 */
export function validateElementStyle(style: ElementStyle): ElementStyle {
  const result: ElementStyle = {};

  const cleanColor = (color?: string) => {
    if (!color) return undefined;
    const sanitized = sanitizeStyleValue(color);
    return isValidColor(sanitized) ? sanitized : undefined;
  };

  const cleanLength = (len?: string) => {
    if (!len) return undefined;
    const sanitized = sanitizeStyleValue(len);
    return isValidLength(sanitized) ? sanitized : undefined;
  };

  // Colors
  if (style.backgroundColor) result.backgroundColor = cleanColor(style.backgroundColor);
  if (style.backgroundGradient) result.backgroundGradient = sanitizeStyleValue(style.backgroundGradient);
  if (style.backgroundImageUrl) result.backgroundImageUrl = sanitizeStyleValue(style.backgroundImageUrl);
  if (typeof style.overlayOpacity === 'number') {
    result.overlayOpacity = Math.max(0, Math.min(1, style.overlayOpacity));
  }
  if (style.textColor) result.textColor = cleanColor(style.textColor);
  if (style.headingColor) result.headingColor = cleanColor(style.headingColor);
  if (style.subheadingColor) result.subheadingColor = cleanColor(style.subheadingColor);
  if (style.linkColor) result.linkColor = cleanColor(style.linkColor);
  if (style.linkHoverColor) result.linkHoverColor = cleanColor(style.linkHoverColor);
  if (style.iconColor) result.iconColor = cleanColor(style.iconColor);
  if (style.borderColor) result.borderColor = cleanColor(style.borderColor);
  if (style.borderHoverColor) result.borderHoverColor = cleanColor(style.borderHoverColor);
  if (style.buttonBgColor) result.buttonBgColor = cleanColor(style.buttonBgColor);
  if (style.buttonTextColor) result.buttonTextColor = cleanColor(style.buttonTextColor);
  if (style.buttonHoverBgColor) result.buttonHoverBgColor = cleanColor(style.buttonHoverBgColor);
  if (style.buttonHoverTextColor) result.buttonHoverTextColor = cleanColor(style.buttonHoverTextColor);
  if (style.cardBgColor) result.cardBgColor = cleanColor(style.cardBgColor);
  if (style.cardHoverBgColor) result.cardHoverBgColor = cleanColor(style.cardHoverBgColor);
  if (style.cardBorderColor) result.cardBorderColor = cleanColor(style.cardBorderColor);
  if (style.cardShadow) result.cardShadow = sanitizeStyleValue(style.cardShadow);

  // Spacing
  if (style.paddingTop) result.paddingTop = cleanLength(style.paddingTop);
  if (style.paddingRight) result.paddingRight = cleanLength(style.paddingRight);
  if (style.paddingBottom) result.paddingBottom = cleanLength(style.paddingBottom);
  if (style.paddingLeft) result.paddingLeft = cleanLength(style.paddingLeft);
  if (style.marginTop) result.marginTop = cleanLength(style.marginTop);
  if (style.marginRight) result.marginRight = cleanLength(style.marginRight);
  if (style.marginBottom) result.marginBottom = cleanLength(style.marginBottom);
  if (style.marginLeft) result.marginLeft = cleanLength(style.marginLeft);

  // Dimensions
  if (style.width) result.width = cleanLength(style.width);
  if (style.maxWidth) result.maxWidth = cleanLength(style.maxWidth);
  if (style.minWidth) result.minWidth = cleanLength(style.minWidth);
  if (style.height) result.height = cleanLength(style.height);
  if (style.maxHeight) result.maxHeight = cleanLength(style.maxHeight);
  if (style.minHeight) result.minHeight = cleanLength(style.minHeight);
  if (style.aspectRatio) result.aspectRatio = sanitizeStyleValue(style.aspectRatio);
  if (style.overflow && ['visible', 'hidden', 'scroll', 'auto'].includes(style.overflow)) {
    result.overflow = style.overflow;
  }

  // Gap & Layout
  if (style.display && ['block', 'flex', 'grid', 'inline-flex', 'none'].includes(style.display)) {
    result.display = style.display;
  }
  if (style.flexDirection && ['row', 'row-reverse', 'column', 'column-reverse'].includes(style.flexDirection)) {
    result.flexDirection = style.flexDirection;
  }
  if (style.flexWrap && ['nowrap', 'wrap', 'wrap-reverse'].includes(style.flexWrap)) {
    result.flexWrap = style.flexWrap;
  }
  if (style.justifyContent && ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'].includes(style.justifyContent)) {
    result.justifyContent = style.justifyContent;
  }
  if (style.alignItems && ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'].includes(style.alignItems)) {
    result.alignItems = style.alignItems;
  }
  if (style.rowGap) result.rowGap = cleanLength(style.rowGap);
  if (style.columnGap) result.columnGap = cleanLength(style.columnGap);
  if (style.gridTemplateColumns) result.gridTemplateColumns = sanitizeStyleValue(style.gridTemplateColumns);

  // Typography
  if (style.fontFamily) result.fontFamily = sanitizeStyleValue(style.fontFamily);
  if (style.fontSize) result.fontSize = cleanLength(style.fontSize);
  if (style.fontWeight) result.fontWeight = sanitizeStyleValue(String(style.fontWeight));
  if (style.lineHeight) result.lineHeight = sanitizeStyleValue(String(style.lineHeight));
  if (style.letterSpacing) result.letterSpacing = cleanLength(style.letterSpacing);
  if (style.textAlign && ['left', 'center', 'right', 'justify'].includes(style.textAlign)) {
    result.textAlign = style.textAlign;
  }
  if (style.textTransform && ['none', 'uppercase', 'lowercase', 'capitalize'].includes(style.textTransform)) {
    result.textTransform = style.textTransform;
  }
  if (style.textDecoration && ['none', 'underline', 'line-through'].includes(style.textDecoration)) {
    result.textDecoration = style.textDecoration;
  }

  // Borders & Shadows
  if (style.borderWidth) result.borderWidth = cleanLength(style.borderWidth);
  if (style.borderStyle && ['solid', 'dashed', 'dotted', 'none'].includes(style.borderStyle)) {
    result.borderStyle = style.borderStyle;
  }
  if (style.borderRadius) result.borderRadius = cleanLength(style.borderRadius);
  if (style.boxShadow) result.boxShadow = sanitizeStyleValue(style.boxShadow);

  // Scoped custom CSS variables
  if (style.customVariables && typeof style.customVariables === 'object') {
    const cleanVars: Record<string, string> = {};
    for (const [k, v] of Object.entries(style.customVariables)) {
      if (/^--[a-z0-9_-]+$/i.test(k) && typeof v === 'string') {
        cleanVars[k] = sanitizeStyleValue(v);
      }
    }
    if (Object.keys(cleanVars).length > 0) {
      result.customVariables = cleanVars;
    }
  }

  return result;
}

/**
 * Converts an ElementStyle object into a CSS declarations string
 */
export function elementStyleToCss(style: ElementStyle, selector: string): string {
  const rules: string[] = [];
  const hoverRules: string[] = [];

  // Direct CSS Properties
  if (style.backgroundColor) rules.push(`background-color: ${style.backgroundColor};`);
  if (style.backgroundGradient && style.backgroundImageUrl) {
    rules.push(`background-image: ${style.backgroundGradient}, url("${style.backgroundImageUrl}"); background-size: cover; background-position: center;`);
  } else if (style.backgroundGradient) {
    rules.push(`background-image: ${style.backgroundGradient};`);
  } else if (style.backgroundImageUrl) {
    rules.push(`background-image: url("${style.backgroundImageUrl}"); background-size: cover; background-position: center;`);
  }
  if (style.textColor) rules.push(`color: ${style.textColor};`);
  if (style.paddingTop) rules.push(`padding-top: ${style.paddingTop};`);
  if (style.paddingRight) rules.push(`padding-right: ${style.paddingRight};`);
  if (style.paddingBottom) rules.push(`padding-bottom: ${style.paddingBottom};`);
  if (style.paddingLeft) rules.push(`padding-left: ${style.paddingLeft};`);
  if (style.marginTop) rules.push(`margin-top: ${style.marginTop};`);
  if (style.marginRight) rules.push(`margin-right: ${style.marginRight};`);
  if (style.marginBottom) rules.push(`margin-bottom: ${style.marginBottom};`);
  if (style.marginLeft) rules.push(`margin-left: ${style.marginLeft};`);

  if (style.width) rules.push(`width: ${style.width};`);
  if (style.maxWidth) rules.push(`max-width: ${style.maxWidth};`);
  if (style.minWidth) rules.push(`min-width: ${style.minWidth};`);
  if (style.height) rules.push(`height: ${style.height};`);
  if (style.maxHeight) rules.push(`max-height: ${style.maxHeight};`);
  if (style.minHeight) rules.push(`min-height: ${style.minHeight};`);
  if (style.aspectRatio) rules.push(`aspect-ratio: ${style.aspectRatio};`);
  if (style.overflow) rules.push(`overflow: ${style.overflow};`);

  if (style.display) rules.push(`display: ${style.display};`);
  if (style.flexDirection) rules.push(`flex-direction: ${style.flexDirection};`);
  if (style.flexWrap) rules.push(`flex-wrap: ${style.flexWrap};`);
  if (style.justifyContent) rules.push(`justify-content: ${style.justifyContent};`);
  if (style.alignItems) rules.push(`align-items: ${style.alignItems};`);
  if (style.rowGap) rules.push(`row-gap: ${style.rowGap};`);
  if (style.columnGap) rules.push(`column-gap: ${style.columnGap};`);
  if (style.gridTemplateColumns) rules.push(`grid-template-columns: ${style.gridTemplateColumns};`);

  if (style.fontFamily) rules.push(`font-family: ${style.fontFamily};`);
  if (style.fontSize) rules.push(`font-size: ${style.fontSize};`);
  if (style.fontWeight) rules.push(`font-weight: ${style.fontWeight};`);
  if (style.lineHeight) rules.push(`line-height: ${style.lineHeight};`);
  if (style.letterSpacing) rules.push(`letter-spacing: ${style.letterSpacing};`);
  if (style.textAlign) rules.push(`text-align: ${style.textAlign};`);
  if (style.textTransform) rules.push(`text-transform: ${style.textTransform};`);
  if (style.textDecoration) rules.push(`text-decoration: ${style.textDecoration};`);

  if (style.borderWidth) rules.push(`border-width: ${style.borderWidth};`);
  if (style.borderStyle) rules.push(`border-style: ${style.borderStyle};`);
  if (style.borderColor) rules.push(`border-color: ${style.borderColor};`);
  if (style.borderRadius) rules.push(`border-radius: ${style.borderRadius};`);
  if (style.boxShadow) rules.push(`box-shadow: ${style.boxShadow};`);

  // Emitted Scoped CSS Custom Properties for sub-element consumption
  if (style.backgroundColor) rules.push(`--ms-bg: ${style.backgroundColor};`);
  if (style.backgroundGradient) rules.push(`--ms-bg-gradient: ${style.backgroundGradient};`);
  if (style.backgroundImageUrl) rules.push(`--ms-bg-image: url("${style.backgroundImageUrl}");`);
  if (style.textColor) rules.push(`--ms-text: ${style.textColor};`);
  if (style.headingColor) rules.push(`--ms-heading: ${style.headingColor};`);
  if (style.subheadingColor) rules.push(`--ms-subheading: ${style.subheadingColor};`);
  if (style.linkColor) rules.push(`--ms-link: ${style.linkColor};`);
  if (style.linkHoverColor) rules.push(`--ms-link-hover: ${style.linkHoverColor};`);
  if (style.iconColor) rules.push(`--ms-icon: ${style.iconColor};`);
  if (style.borderColor) rules.push(`--ms-border: ${style.borderColor};`);
  if (style.buttonBgColor) rules.push(`--ms-btn-bg: ${style.buttonBgColor};`);
  if (style.buttonTextColor) rules.push(`--ms-btn-text: ${style.buttonTextColor};`);
  if (style.buttonHoverBgColor) rules.push(`--ms-btn-hover-bg: ${style.buttonHoverBgColor};`);
  if (style.buttonHoverTextColor) rules.push(`--ms-btn-hover-text: ${style.buttonHoverTextColor};`);
  if (style.cardBgColor) rules.push(`--ms-card-bg: ${style.cardBgColor};`);
  if (style.cardBorderColor) rules.push(`--ms-card-border: ${style.cardBorderColor};`);
  if (style.cardShadow) rules.push(`--ms-card-shadow: ${style.cardShadow};`);
  if (typeof style.overlayOpacity === 'number') rules.push(`--ms-overlay-opacity: ${style.overlayOpacity};`);

  if (style.customVariables) {
    for (const [k, v] of Object.entries(style.customVariables)) {
      rules.push(`${k}: ${v};`);
    }
  }

  // Hover states
  if (style.linkHoverColor) {
    hoverRules.push(`${selector} a:hover { color: ${style.linkHoverColor} !important; }`);
  }
  if (style.buttonHoverBgColor || style.buttonHoverTextColor) {
    const btnHovers: string[] = [];
    if (style.buttonHoverBgColor) btnHovers.push(`background-color: ${style.buttonHoverBgColor} !important;`);
    if (style.buttonHoverTextColor) btnHovers.push(`color: ${style.buttonHoverTextColor} !important;`);
    hoverRules.push(`${selector} .btn:hover, ${selector} button:hover { ${btnHovers.join(' ')} }`);
  }
  if (style.cardHoverBgColor) {
    hoverRules.push(`${selector} .card:hover, ${selector} article:hover { background-color: ${style.cardHoverBgColor} !important; }`);
  }

  let output = '';
  if (rules.length > 0) {
    output += `${selector} {\n  ${rules.join('\n  ')}\n}\n`;
  }
  if (hoverRules.length > 0) {
    output += hoverRules.join('\n') + '\n';
  }

  return output;
}

/**
 * Generates complete scoped CSS stylesheet with desktop, tablet, and mobile media queries
 */
export function generateStyleSheet(overrides: StyleOverridesMap): string {
  let baseCss = '';
  let tabletCss = '';
  let mobileCss = '';

  for (const [id, responsive] of Object.entries(overrides)) {
    if (!id || !responsive) continue;
    const sanitizedId = id.replace(/[^a-z0-9_.:-]/gi, '');
    const selector = `[data-style-id="${sanitizedId}"]`;

    if (responsive.base) {
      const cleanBase = validateElementStyle(responsive.base);
      baseCss += elementStyleToCss(cleanBase, selector);
    }

    if (responsive.tablet) {
      const cleanTablet = validateElementStyle(responsive.tablet);
      tabletCss += elementStyleToCss(cleanTablet, selector);
    }

    if (responsive.mobile) {
      const cleanMobile = validateElementStyle(responsive.mobile);
      mobileCss += elementStyleToCss(cleanMobile, selector);
    }
  }

  let finalSheet = '/* MindSparQ Dynamic Style Overrides */\n' + baseCss;

  if (tabletCss.trim()) {
    finalSheet += `\n@media (max-width: 768px) {\n${tabletCss}}\n`;
  }

  if (mobileCss.trim()) {
    finalSheet += `\n@media (max-width: 480px) {\n${mobileCss}}\n`;
  }

  return finalSheet;
}
