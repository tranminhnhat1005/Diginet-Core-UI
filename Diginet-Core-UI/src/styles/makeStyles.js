import {
  makeStyles as makeStylesWithoutDefault,
} from '../../../Diginet-Core-UI-styles';
import defaultTheme from './defaultTheme';

const makeStyles = (stylesOrCreator, options = {}) => {
  return makeStylesWithoutDefault (stylesOrCreator, {
    defaultTheme,
    ...options,
  });
};

export default makeStyles;
