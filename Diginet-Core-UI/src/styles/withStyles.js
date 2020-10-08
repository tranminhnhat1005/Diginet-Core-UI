import {
  withStyles as withStylesWithoutDefault,
} from '../../../Diginet-Core-UI-styles';
import defaultTheme from './defaultTheme';

function withStyles (stylesOrCreator, options) {
  return withStylesWithoutDefault (stylesOrCreator, {
    defaultTheme,
    ...options,
  });
}

export default withStyles;
