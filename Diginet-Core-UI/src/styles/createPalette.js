import {deepMerge} from '../../../Diginet-Core-UI-utils';
import common from '../colors/common';
import grey from '../colors/grey';
import indigo from '../colors/indigo';
import pink from '../colors/pink';
import red from '../colors/red';
import orange from '../colors/orange';
import blue from '../colors/blue';
import green from '../colors/green';
import {darken, getContrastRatio, lighten} from './colorManipulator';

export const light = {
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.54)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  background: {
    paper: common.white,
    default: grey[50],
  },
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    hoverOpacity: 0.04,
    selected: 'rgba(0, 0, 0, 0.08)',
    selectedOpacity: 0.08,
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(0, 0, 0, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },
};

export const dark = {
  text: {
    primary: common.white,
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    hint: 'rgba(255, 255, 255, 0.5)',
    icon: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  background: {
    paper: grey[800],
    default: '#303030',
  },
  action: {
    active: common.white,
    hover: 'rgba(255, 255, 255, 0.08)',
    hoverOpacity: 0.08,
    selected: 'rgba(255, 255, 255, 0.16)',
    selectedOpacity: 0.16,
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(255, 255, 255, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.24,
  },
};

const addLightOrDark = (intent, direction, shade, tonalOffset) => {
  const tonalOffsetLight = tonalOffset.light || tonalOffset;
  const tonalOffsetDark = tonalOffset.dark || tonalOffset * 1.5;

  if (!intent[direction]) {
    if (intent.hasOwnProperty (shade)) {
      intent[direction] = intent[shade];
    } else if (direction === 'light') {
      intent.light = lighten (intent.main, tonalOffsetLight);
    } else if (direction === 'dark') {
      intent.dark = darken (intent.main, tonalOffsetDark);
    }
  }
};

const createPalette = palette => {
  const {
    primary = {
      light: indigo[300],
      main: indigo[500],
      dark: indigo[700],
    },
    secondary = {
      light: pink.A200,
      main: pink.A400,
      dark: pink.A700,
    },
    error = {
      light: red[300],
      main: red[500],
      dark: red[700],
    },
    warning = {
      light: orange[300],
      main: orange[500],
      dark: orange[700],
    },
    info = {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
    },
    success = {
      light: green[300],
      main: green[500],
      dark: green[700],
    },
    type = 'light',
    contrastThreshold = 3,
    tonalOffset = 0.2,
    ...other
  } = palette;

  const getContrastText = background => {
    const contrastText = getContrastRatio (background, dark.text.primary) >=
      contrastThreshold
      ? dark.text.primary
      : light.text.primary;

    if (process.env.NODE_ENV !== 'production') {
      const contrast = getContrastRatio (background, contrastText);
      if (contrast < 3) {
        console.error (
          [
            `Diginet-Core-UI: The contrast ratio of ${contrast}:1 for ${contrastText} on ${background}`,
            'falls below the WCAG recommended absolute minimum contrast ratio of 3:1.',
            'https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast',
          ].join ('\n')
        );
      }
    }

    return contrastText;
  };

  const augmentColor = (
    color,
    mainShade = 500,
    lightShade = 300,
    darkShade = 700
  ) => {
    color = {...color};
    if (!color.main && color[mainShade]) {
      color.main = color[mainShade];
    }

    if (!color.main) {
      throw ('Diginet-Core-UI: The color provided to augmentColor(color) is invalid.\n' +
        'The color object needs to have a `main` property or a `%s` property.', mainShade);
    }

    if (typeof color.main !== 'string') {
      throw ('Diginet-Core-UI: The color provided to augmentColor(color) is invalid.\n' +
        '`color.main` should be a string, but `%s` was provided instead.\n\n' +
        'Did you intend to use one of the following approaches?\n\n' +
        'import { green } from "diginet-core-ui/src/colors";\n\n' +
        'const theme1 = createDCUITheme({ palette: {\n' +
        '  primary: green,\n' +
        '} });\n\n' +
        'const theme2 = createDCUITheme({ palette: {\n' +
        '  primary: { main: green[500] },\n' +
        '} });', JSON.stringify (color.main));
    }

    addLightOrDark (color, 'light', lightShade, tonalOffset);
    addLightOrDark (color, 'dark', darkShade, tonalOffset);
    if (!color.contrastText) {
      color.contrastText = getContrastText (color.main);
    }

    return color;
  };

  const types = {dark, light};

  if (process.env.NODE_ENV !== 'production') {
    if (!types[type]) {
      console.error (
        `Diginet-Core-UI: The palette type \`${type}\` is not supported.`
      );
    }
  }

  const paletteOutput = deepMerge (
    {
      common,
      type,
      primary: augmentColor (primary),
      secondary: augmentColor (secondary, 'A400', 'A200', 'A700'),
      error: augmentColor (error),
      warning: augmentColor (warning),
      info: augmentColor (info),
      success: augmentColor (success),
      grey,
      contrastThreshold,
      getContrastText,
      augmentColor,
      tonalOffset,
      ...types[type],
    },
    other
  );

  return paletteOutput;
};

export default createPalette;
