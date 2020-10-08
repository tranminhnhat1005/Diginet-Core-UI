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
