/* eslint-disable import/export */
import {ponyFillGlobal} from '../Diginet-Core-UI-utils';

if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'test' &&
  typeof window !== 'undefined'
) {
  ponyFillGlobal['__@diginet-core-ui/styles-init__'] =
    ponyFillGlobal['__@diginet-core-ui/styles-init__'] || 0;

  if (ponyFillGlobal['__@diginet-core-ui/styles-init__'] === 1) {
    console.warn (
      [
        'It looks like there are several instances of `@diginet-core-ui/styles` initialized in this application.',
        'This may cause theme propagation issues, broken class names, ' +
          'specificity issues, and makes your application bigger without a good reason.',
        '',
      ].join ('\n')
    );
  }

  ponyFillGlobal['__@diginet-core-ui/styles-init__'] += 1;
}

export {default as createGenerateClassName} from './createGenerateClassName';
export {default as createStyles} from './createStyles';
export {default as getThemeProps} from './getThemeProps';
export * from './makeStyles';
export {default as makeStyles} from './makeStyles';
export {default as mergeClasses} from './mergeClasses';
export {default as styled} from './styled';
export {default as StylesProvider} from './StylesProvider';
export * from './ThemeProvider';
export {default as ThemeProvider} from './ThemeProvider';
export * from './useTheme';
export {default as useTheme} from './useTheme';
export {default as withStyles} from './withStyles';
export {default as withTheme} from './withTheme';
