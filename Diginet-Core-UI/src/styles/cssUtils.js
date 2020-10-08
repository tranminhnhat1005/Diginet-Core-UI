export const isUnitLess = value => {
  return String (parseFloat (value)).length === String (value).length;
};

export const getUnit = input => {
  return String (input).match (/[\d.\-+]*\s*(.*)/)[1] || '';
};

export const toUnitLess = length => {
  return parseFloat (length);
};

export const convertLength = baseFontSize => {
  return (length, toUnit) => {
    const fromUnit = getUnit (length);

    if (fromUnit === toUnit) {
      return length;
    }

    let pxLength = toUnitLess (length);

    if (fromUnit !== 'px') {
      if (fromUnit === 'em') {
        pxLength = toUnitLess (length) * toUnitLess (baseFontSize);
      } else if (fromUnit === 'rem') {
        pxLength = toUnitLess (length) * toUnitLess (baseFontSize);
        return length;
      }
    }

    let outputLength = pxLength;
    if (toUnit !== 'px') {
      if (toUnit === 'em') {
        outputLength = pxLength / toUnitLess (baseFontSize);
      } else if (toUnit === 'rem') {
        outputLength = pxLength / toUnitLess (baseFontSize);
      } else {
        return length;
      }
    }

    return parseFloat (outputLength.toFixed (5)) + toUnit;
  };
};

export const alignProperty = ({size, grid}) => {
  const sizeBelow = size - size % grid;
  const sizeAbove = sizeBelow + grid;

  return size - sizeBelow < sizeAbove - size ? sizeBelow : sizeAbove;
};

export const fontGrid = ({lineHeight, pixels, htmlFontSize}) => {
  return pixels / (lineHeight * htmlFontSize);
};

/**
 * generate a responsive version of a given CSS property
 * @example
 * responsiveProperty({
 *   cssProperty: 'fontSize',
 *   min: 15,
 *   max: 20,
 *   unit: 'px',
 *   breakpoints: [300, 600],
 * })
 *
 * // this returns
 *
 * {
 *   fontSize: '15px',
 *   '@media (min-width:300px)': {
 *     fontSize: '17.5px',
 *   },
 *   '@media (min-width:600px)': {
 *     fontSize: '20px',
 *   },
 * }
 *
 * @param {Object} params
 * @param {string} params.cssProperty - The CSS property to be made responsive
 * @param {number} params.min - The smallest value of the CSS property
 * @param {number} params.max - The largest value of the CSS property
 * @param {string} [params.unit] - The unit to be used for the CSS property
 * @param {Array.number} [params.breakpoints]  - An array of breakpoints
 * @param {number} [params.alignStep] - Round scaled value to fall under this grid
 * @returns {Object} responsive styles for {params.cssProperty}
 */
export const responsiveProperty = ({
  cssProperty,
  min,
  max,
  unit = 'rem',
  breakpoints = [600, 960, 1280],
  transform = null,
}) => {
  const output = {
    [cssProperty]: `${min}${unit}`,
  };

  const factor = (max - min) / breakpoints[breakpoints.length - 1];
  breakpoints.forEach (breakpoint => {
    let value = min + factor * breakpoint;

    if (transform !== null) {
      value = transform (value);
    }

    output[`@media (min-width:${breakpoint}px)`] = {
      [cssProperty]: `${Math.round (value * 10000) / 10000}${unit}`,
    };
  });

  return output;
};
