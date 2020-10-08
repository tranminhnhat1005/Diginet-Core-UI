import {deepMerge} from '../../../Diginet-Core-UI-utils';
import createBreakpoints from './createBreakpoints';
import createMixin from './createMixin';
import createPalette from './createPalette';
import createSpacing from './createSpacing';
import createTypography from './createTypography';
import shadows from './shadows';
import shape from './shape';
import transitions from './transitions';
import zIndex from './zIndex';

function createDCUITheme (options = {}, ...args) {
  const {
    breakpoints: breakpointsInput = {},
    mixin: mixinInput = {},
    palette: paletteInput = {},
    spacing: spacingInput,
    typography: typographyInput = {},
    ...other
  } = options;

  const palette = createPalette (paletteInput);
  const breakpoints = createBreakpoints (breakpointsInput);
  const spacing = createSpacing (spacingInput);

  let dcuiTheme = deepMerge (
    {
      breakpoints,
      direction: 'ltr',
      mixin: createMixin (breakpoints, spacing, mixinInput),
      overrides: {}, // Inject custom styles
      palette,
      props: {}, // Provide default props
      shadows,
      typography: createTypography (palette, typographyInput),
      spacing,
      shape,
      transitions,
      zIndex,
    },
    other
  );

  dcuiTheme = args.reduce (
    (acc, argument) => deepMerge (acc, argument),
    dcuiTheme
  );

  if (process.env.NODE_ENV !== 'production') {
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
    const traverse = (node, parentKey, depth = 1) => {
      let key;

      // eslint-disable-next-line guard-for-in, no-restricted-syntax
      for (key in node) {
        const child = node[key];
        if (depth === 1) {
          if (key.indexOf ('DCUI') === 0 && child) {
            traverse (child, key, depth + 1);
          }
        } else if (
          pseudoClasses.indexOf (key) !== -1 &&
          Object.keys (child).length > 0
        ) {
          if (process.env.NODE_ENV !== 'production') {
            console.error (
              [
                `Diginet-Core-UI: The \`${parentKey}\` component increases ` +
                  `the CSS specificity of the \`${key}\` internal state.`,
                'You can not override it like this: ',
                JSON.stringify (node, null, 2),
                '',
                'Instead, you need to use the $ruleName syntax:',
                JSON.stringify (
                  {
                    root: {
                      [`&$${key}`]: child,
                    },
                  },
                  null,
                  2
                ),
                '',
              ].join ('\n')
            );
          }
          // Remove the style to prevent global conflicts.
          node[key] = {};
        }
      }
    };

    traverse (dcuiTheme.overrides);
  }

  return dcuiTheme;
}

export default createDCUITheme;
