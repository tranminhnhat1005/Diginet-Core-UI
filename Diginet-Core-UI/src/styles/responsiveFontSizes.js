import {
  isUnitLess,
  convertLength,
  responsiveProperty,
  alignProperty,
} from './cssUtils';

const responsiveFontSizes = (themeInput, options = {}) => {
  const {
    breakpoints = ['sm', 'md', 'lg'],
    disableAlign = false,
    factor = 2,
    variants = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
      'body2',
      'caption',
      'button',
      'overline',
    ],
  } = options;

  const theme = {...themeInput};
  theme.typography = {...theme.typography};
  const typography = theme.typography;

  const convert = convertLength (typography.htmlFontSize);
  const breakpointValues = breakpoints.map (x => theme.breakpoints.values[x]);

  variants.forEach (variant => {
    const style = typography[variant];
    const remFontSize = parseFloat (convert (style.fontSize, 'rem'));

    if (remFontSize <= 1) {
      return;
    }

    const maxFontSize = remFontSize;
    const minFontSize = 1 + (maxFontSize - 1) / factor;

    let {lineHeight} = style;

    if (!isUnitLess (lineHeight) && !disableAlign) {
      throw new Error (
        'Diginet-Core-UI: Unsupported non-unit less line height with grid alignment.\n' +
          'Use unit less line heights instead.'
      );
    }

    if (!isUnitLess (lineHeight)) {
      lineHeight =
        parseFloat (convert (lineHeight, 'rem')) / parseFloat (remFontSize);
    }

    let transform = null;

    if (!disableAlign) {
      transform = value =>
        alignProperty ({
          size: value,
          grid: fontGrid ({
            pixels: 4,
            lineHeight,
            htmlFontSize: typography.htmlFontSize,
          }),
        });
    }

    typography[variant] = {
      ...style,
      ...responsiveProperty ({
        cssProperty: 'fontSize',
        min: minFontSize,
        max: maxFontSize,
        unit: 'rem',
        breakpoints: breakpointValues,
        transform,
      }),
    };
  });

  return theme;
};

export default responsiveFontSizes;
