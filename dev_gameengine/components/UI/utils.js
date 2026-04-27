import React, { forwardRef } from 'react';

const STYLE_ALIAS = {
  p: 'padding',
  pt: 'paddingTop',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  m: 'margin',
  mt: 'marginTop',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mr: 'marginRight',
  w: 'width',
  h: 'height',
  maxW: 'maxWidth',
  minW: 'minWidth',
  maxH: 'maxHeight',
  minH: 'minHeight',
  bg: 'background',
  boxShadow: 'boxShadow',
  shadow: 'boxShadow',
  borderRadius: 'borderRadius',
  borderColor: 'borderColor',
  borderWidth: 'borderWidth',
  borderTopWidth: 'borderTopWidth',
  borderBottomWidth: 'borderBottomWidth',
  borderLeftWidth: 'borderLeftWidth',
  borderRightWidth: 'borderRightWidth',
  lineHeight: 'lineHeight',
  letterSpacing: 'letterSpacing',
  wordBreak: 'wordBreak',
  whiteSpace: 'whiteSpace',
  zIndex: 'zIndex',
  gap: 'gap',
  alignSelf: 'alignSelf',
  justifySelf: 'justifySelf',
  flexShrink: 'flexShrink',
  flexGrow: 'flexGrow',
  overflowX: 'overflowX',
  overflowY: 'overflowY',
  cursor: 'cursor',
  visibility: 'visibility',
  opacity: 'opacity',
  userSelect: 'userSelect',
  pointerEvents: 'pointerEvents'
};

const DIRECT_STYLES = new Set(['color', 'fontSize', 'fontWeight', 'fontFamily', 'width', 'height', 'padding', 'margin', 'background', 'backgroundColor', 'border', 'borderTop', 'borderBottom', 'borderLeft', 'borderRight', 'position', 'top', 'bottom', 'left', 'right', 'display', 'overflow', 'flex', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'outline', 'transform', 'transition', 'textAlign', 'textTransform', 'textDecoration']);

// Props that are Chakra-only and must not reach the DOM
const SKIP_PROPS = new Set(['variant', 'colorScheme', 'colorPalette', 'size', 'focusRing', 'loading', 'isDisabled', 'as', 'asChild', 'motionPreset', 'placement', 'positioning', 'interactive', 'striped', 'showColumnBorder', 'collection', 'onValueChange', 'onCheckedChange', 'checkedIcon', 'uncheckedIcon', 'inputMode']);

function resolveResponsive(val) {
  if (val && typeof val === 'object' && !Array.isArray(val) && 'base' in val) {
    return val.base;
  }
  return val;
}

function clean(val) {
  return typeof val === 'string' ? val.replace(/\s*!important/gi, '') : val;
}

export function extractStyleProps(props) {
  const style = {};
  const rest = {};
  for (const [k, rawVal] of Object.entries(props)) {
    if (SKIP_PROPS.has(k) || k.startsWith('_') && k !== '_') continue;
    const val = resolveResponsive(rawVal);
    if (k === 'px') {
      style.paddingLeft = clean(val);
      style.paddingRight = clean(val);
    } else if (k === 'py') {
      style.paddingTop = clean(val);
      style.paddingBottom = clean(val);
    } else if (k === 'mx') {
      style.marginLeft = clean(val);
      style.marginRight = clean(val);
    } else if (k === 'my') {
      style.marginTop = clean(val);
      style.marginBottom = clean(val);
    } else if (k === 'boxSize') {
      style.width = clean(val);
      style.height = clean(val);
    } else if (k === 'direction') {
      style.flexDirection = clean(val);
    } else if (k === 'align' && !props.alignItems) {
      style.alignItems = clean(val);
    } else if (k === 'justify' && !props.justifyContent) {
      style.justifyContent = clean(val);
    } else if (k === 'wrap') {
      style.flexWrap = clean(val);
    } else if (STYLE_ALIAS[k]) {
      style[STYLE_ALIAS[k]] = clean(val);
    } else if (DIRECT_STYLES.has(k)) {
      style[k] = clean(val);
    } else {
      rest[k] = rawVal;
    }
  }
  return {
    style,
    rest
  };
}

export function el(tag, baseStyle = {}) {
  const Comp = forwardRef(({
    children,
    className,
    style: styleProp,
    ...props
  }, ref) => {
    const {
      style: extracted,
      rest
    } = extractStyleProps(props);
    const finalStyle = {
      ...baseStyle,
      ...extracted,
      ...styleProp
    };
    // Remove any remaining unknown non-HTML keys (safety net)
    const {
      dangerouslySetInnerHTML,
      ...safeRest
    } = rest;
    return React.createElement(tag, {
      ...safeRest,
      ...(dangerouslySetInnerHTML ? {
        dangerouslySetInnerHTML
      } : {}),
      className,
      style: finalStyle,
      ref
    }, children);
  });
  return Comp;
}

// Inject global CSS for animations (once)
if (typeof document !== 'undefined' && !document.getElementById('gf-ui-animations')) {
  const style = document.createElement('style');
  style.id = 'gf-ui-animations';
  style.textContent = `
        @keyframes gf-spin { to { transform: rotate(360deg); } }
        @keyframes gf-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
  document.head.appendChild(style);
}
