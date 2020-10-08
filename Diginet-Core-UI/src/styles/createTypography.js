import {deepMerge} from '../utils/Diginet-Core-UI/deepMerge';
import {round} from '../utils/round';

const caseAllCaps = {
  textTransform: 'uppercase',
};
const defaultFontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';

const createTypography = (palette, typography) => {
  const {
    fontFamily = defaultFontFamily,
    fontSize = 14, // px
    fontWeightLight = 300,
    fontWeightRegular = 500,
    fontWeightMedium = 700,
    fontWeightBold = 900,
    htmlFontSize = 16,
    allVariants,
    pxToRem: pxToRem2,
    ...other
  } = typeof typography === 'function' ? typography (palette) : typography;

  if (process.env.NODE_ENV !== 'production') {
    if (typeof fontSize !== 'number') {
      console.error ('Diginet-Core-UI: `fontSize` is required to be a number.');
    }

    if (typeof htmlFontSize !== 'number') {
      console.error (
        'Diginet-Core-UI: `htmlFontSize` is required to be a number.'
      );
    }
  }

  const coefficient = fontSize / 14;
  const pxToRem =
    pxToRem2 || (size => `${size / htmlFontSize * coefficient}rem`);
  const buildVariant = (
    fontWeight,
    size,
    lineHeight,
    letterSpacing,
    casing
  ) => ({
    fontFamily,
    fontWeight,
    fontSize: pxToRem (size),
    lineHeight,
    ...(fontFamily === defaultFontFamily
      ? {letterSpacing: `${round (letterSpacing / size)}em`}
      : {}),
    ...casing,
    ...allVariants,
  });

  const variants = {
    h1: buildVariant (fontWeightLight, 96, 1.167, -1.5),
    h2: buildVariant (fontWeightLight, 60, 1.2, -0.5),
    h3: buildVariant (fontWeightRegular, 48, 1.167, 0),
    h4: buildVariant (fontWeightRegular, 34, 1.235, 0.25),
    h5: buildVariant (fontWeightRegular, 24, 1.334, 0),
    h6: buildVariant (fontWeightMedium, 20, 1.6, 0.15),
    subtitle1: buildVariant (fontWeightRegular, 16, 1.75, 0.15),
    subtitle2: buildVariant (fontWeightMedium, 14, 1.57, 0.1),
    body1: buildVariant (fontWeightRegular, 16, 1.5, 0.15),
    body2: buildVariant (fontWeightRegular, 14, 1.43, 0.15),
    button: buildVariant (fontWeightMedium, 14, 1.75, 0.4, caseAllCaps),
    caption: buildVariant (fontWeightRegular, 12, 1.66, 0.4),
    overline: buildVariant (fontWeightRegular, 12, 2.66, 1, caseAllCaps),
  };

  return deepMerge (
    {
      htmlFontSize,
      pxToRem,
      round, // TODO v5: remove
      fontFamily,
      fontSize,
      fontWeightLight,
      fontWeightRegular,
      fontWeightMedium,
      fontWeightBold,
      ...variants,
    },
    other,
    {
      clone: false, // No need to clone deep
    }
  );
};

export default createTypography;
