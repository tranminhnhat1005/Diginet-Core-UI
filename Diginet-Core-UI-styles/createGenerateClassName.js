import nested from './ThemeProvider/nested';

const pseudoClasses = [
  'checked',
  'disabled',
  'error',
  'focused',
  'focusVisible',
  'required',
  'expanded',
  'selected',
];

const createGenerateClassName = (options = {}) => {
  const {disableGlobal = false, productionPrefix = 'jss', seed = ''} = options;
  const seedPrefix = seed === '' ? '' : `${seed}-`;
  let ruleCounter = 0;

  const getNextCounterId = () => {
    ruleCounter += 1;
    if (process.env.NODE_ENV !== 'production') {
      if (ruleCounter >= 1e10) {
        console.warn (
          [
            'Diginet-Core-UI: You might have a memory leak.',
            'The ruleCounter is not supposed to grow that much.',
          ].join ('')
        );
      }
    }
    return ruleCounter;
  };

  return (rule, styleSheet) => {
    const name = styleSheet.options.name;

    if (
      name &&
      name.indexOf ('DCUI') === 0 &&
      !styleSheet.options.link &&
      !disableGlobal
    ) {
      if (pseudoClasses.indexOf (rule.key) !== -1) {
        return `DCUI-${rule.key}`;
      }

      const prefix = `${seedPrefix}${name}-${rule.key}`;

      if (!styleSheet.options.theme[nested] || seed !== '') {
        return prefix;
      }

      return `${prefix}-${getNextCounterId ()}`;
    }

    if (process.env.NODE_ENV === 'production') {
      return `${seedPrefix}${productionPrefix}${getNextCounterId ()}`;
    }

    const suffix = `${rule.key}-${getNextCounterId ()}`;

    if (styleSheet.options.classNamePrefix) {
      return `${seedPrefix}${styleSheet.options.classNamePrefix}-${suffix}`;
    }

    return `${seedPrefix}${suffix}`;
  };
};

export default createGenerateClassName;
