export const keys = ['xs', 'sm', 'md', 'lg', 'xl'];

const createBreakpoints = breakpoints => {
  const {
    values = {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
    unit = 'px',
    step = 5,
    ...other
  } = breakpoints;

  const up = key => {
    const value = typeof values[key] === 'number' ? values[key] : key;
    return `@media (min-width:${value}${unit})`;
  };

  const down = key => {
    const endIndex = keys.indexOf (key) + 1;
    const upperBound = values[keys[endIndex]];

    if (endIndex === keys.length) {
      return up ('xs');
    }

    const value = typeof upperBound === 'number' && endIndex > 0
      ? upperBound
      : key;
    return `@media (max-width:${value - step / 100}${unit})`;
  };

  const between = (start, end) => {
    const endIndex = keys.indexOf (end);

    if (endIndex === keys.length - 1) {
      return up (start);
    }

    return (
      `@media (min-width:${typeof values[start] === 'number' ? values[start] : start}${unit}) and ` +
      `(max-width:${(endIndex !== -1 && typeof values[keys[endIndex + 1]] === 'number' ? values[keys[endIndex + 1]] : end) - step / 100}${unit})`
    );
  };

  const only = key => {
    return between (key, key);
  };

  const width = key => {
    return values[key];
  };

  return {
    keys,
    values,
    up,
    down,
    between,
    only,
    width,
    ...other,
  };
};

export default createBreakpoints;
