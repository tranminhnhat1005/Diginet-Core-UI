/* eslint-disable no-unused-vars */
import {createUnarySpacing} from './createUnarySpacing';

let warnOnce;

const createSpacing = (spacingInput = 8) => {
  if (spacingInput.dcui) {
    return spacingInput;
  }

  const transform = createUnarySpacing ({
    spacing: spacingInput,
  });

  const spacing = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      if (!(args.length <= 4)) {
        console.error (
          `Diginet-Core-UI: Too many arguments provided, expected between 0 and 4, got ${args.length}`
        );
      }
    }

    if (args.length === 0) {
      return transform (1);
    }

    if (args.length === 1) {
      return transform (args[0]);
    }

    return args
      .map (argument => {
        if (typeof argument === 'string') {
          return argument;
        }
        const output = transform (argument);
        return typeof output === 'number' ? `${output}px` : output;
      })
      .join (' ');
  };

  Object.defineProperty (spacing, 'unit', {
    get: () => {
      if (process.env.NODE_ENV !== 'production') {
        warnOnce = true;
      }
      return spacingInput;
    },
  });
  spacing.dcui = true;

  return spacing;
};
export default createSpacing;
