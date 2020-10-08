import responsivePropType from './responsivePropType';
import {handleBreakpoints} from './breakpoints';
import merge from './merge';
import memoize from './memoize';

const properties = {
  m: 'margin',
  p: 'padding',
};

const directions = {
  t: 'Top',
  r: 'Right',
  b: 'Bottom',
  l: 'Left',
  x: ['Left', 'Right'],
  y: ['Top', 'Bottom'],
};

const aliases = {
  marginX: 'mx',
  marginY: 'my',
  paddingX: 'px',
  paddingY: 'py',
};

// memoize() impact:
// From 300,000 ops/sec
// To 350,000 ops/sec
const getCssProperties = memoize (prop => {
  // It's not a shorthand notation.
  if (prop.length > 2) {
    if (aliases[prop]) {
      prop = aliases[prop];
    } else {
      return [prop];
    }
  }

  const [a, b] = prop.split ('');
  const property = properties[a];
  const direction = directions[b] || '';
  return Array.isArray (direction)
    ? direction.map (dir => property + dir)
    : [property + direction];
});

const spacingKeys = [
  'm',
  'mt',
  'mr',
  'mb',
  'ml',
  'mx',
  'my',
  'p',
  'pt',
  'pr',
  'pb',
  'pl',
  'px',
  'py',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginX',
  'marginY',
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingX',
  'paddingY',
];

export const createUnarySpacing = theme => {
  const themeSpacing = theme.spacing || 8;

  if (typeof themeSpacing === 'number') {
    return abs => {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof abs !== 'number') {
          console.error (
            `Diginet-Core-UI: Expected spacing argument to be a number, got ${abs}.`
          );
        }
      }
      return themeSpacing * abs;
    };
  }

  if (Array.isArray (themeSpacing)) {
    return abs => {
      if (process.env.NODE_ENV !== 'production') {
        if (abs > themeSpacing.length - 1) {
          console.error (
            [
              `Diginet-Core-UI: The value provided (${abs}) overflows.`,
              `The supported values are: ${JSON.stringify (themeSpacing)}.`,
              `${abs} > ${themeSpacing.length - 1}, you need to add the missing values.`,
            ].join ('\n')
          );
        }
      }

      return themeSpacing[abs];
    };
  }

  if (typeof themeSpacing === 'function') {
    return themeSpacing;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error (
      [
        `Diginet-Core-UI: The \`theme.spacing\` value (${themeSpacing}) is invalid.`,
        'It should be a number, an array or a function.',
      ].join ('\n')
    );
  }

  return () => undefined;
};

const getValue = (transformer, propValue) => {
  if (typeof propValue === 'string') {
    return propValue;
  }

  const abs = Math.abs (propValue);
  const transformed = transformer (abs);

  if (propValue >= 0) {
    return transformed;
  }

  if (typeof transformed === 'number') {
    return -transformed;
  }

  return `-${transformed}`;
};

const getStyleFromPropValue = (cssProperties, transformer) => {
  return propValue =>
    cssProperties.reduce ((acc, cssProperty) => {
      acc[cssProperty] = getValue (transformer, propValue);
      return acc;
    }, {});
};

const spacing = props => {
  const theme = props.theme;
  const transformer = createUnarySpacing (theme);

  return Object.keys (props)
    .map (prop => {
      if (spacingKeys.indexOf (prop) === -1) {
        return null;
      }

      const cssProperties = getCssProperties (prop);
      const styleFromPropValue = getStyleFromPropValue (
        cssProperties,
        transformer
      );

      const propValue = props[prop];
      return handleBreakpoints (props, propValue, styleFromPropValue);
    })
    .reduce (merge, {});
};

spacing.propTypes = process.env.NODE_ENV !== 'production'
  ? spacingKeys.reduce ((obj, key) => {
      obj[key] = responsivePropType;
      return obj;
    }, {})
  : {};

spacing.filterProps = spacingKeys;

export default spacing;
