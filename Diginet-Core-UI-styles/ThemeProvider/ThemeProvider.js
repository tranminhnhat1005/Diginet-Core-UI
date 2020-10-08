import React from 'react';
import PropTypes from 'prop-types';
import {exactProp} from '../../Diginet-Core-UI-utils';
import ThemeContext from '../useTheme/ThemeContext';
import useTheme from '../useTheme';
import nested from './nested';

// To support composition of theme.
const mergeOuterLocalTheme = (outerTheme, localTheme) => {
  if (typeof localTheme === 'function') {
    const mergedTheme = localTheme (outerTheme);

    if (process.env.NODE_ENV !== 'production') {
      if (!mergedTheme) {
        console.error (
          [
            'Diginet-Core-UI: You should return an object from your theme function, i.e.',
            '<ThemeProvider theme={() => ({})} />',
          ].join ('\n')
        );
      }
    }

    return mergedTheme;
  }

  return {...outerTheme, ...localTheme};
};

const ThemeProvider = props => {
  const {children, theme: localTheme} = props;
  const outerTheme = useTheme ();

  if (process.env.NODE_ENV !== 'production') {
    if (outerTheme === null && typeof localTheme === 'function') {
      console.error (
        [
          'Diginet-Core-UI: You are providing a theme function prop to the ThemeProvider component:',
          '<ThemeProvider theme={outerTheme => outerTheme} />',
          '',
          'However, no outer theme is present.',
          'Make sure a theme is already injected higher in the React tree ' +
            'or provide a theme object.',
        ].join ('\n')
      );
    }
  }

  const theme = React.useMemo (
    () => {
      const output = outerTheme === null
        ? localTheme
        : mergeOuterLocalTheme (outerTheme, localTheme);

      if (output != null) {
        output[nested] = outerTheme !== null;
      }

      return output;
    },
    [localTheme, outerTheme]
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
  theme: PropTypes.oneOfType ([PropTypes.object, PropTypes.func]).isRequired,
};

if (process.env.NODE_ENV !== 'production') {
  ThemeProvider.propTypes = exactProp (ThemeProvider.propTypes);
}

export default ThemeProvider;
