import React from 'react';
import PropTypes from 'prop-types';
import {
  chainPropTypes,
  getDisplayName,
  hoistNonReactStatics,
} from '../Diginet-Core-UI-utils';
import useTheme from './useTheme';

export const withThemeCreator = (options = {}) => {
  const {defaultTheme} = options;

  const withTheme = Component => {
    if (process.env.NODE_ENV !== 'production') {
      if (Component === undefined) {
        throw new Error (
          [
            'You are calling withTheme(Component) with an undefined component.',
            'You may have forgotten to import it.',
          ].join ('\n')
        );
      }
    }

    const WithTheme = React.forwardRef (function WithTheme (props, ref) {
      const {innerRef, ...other} = props;
      const theme = useTheme () || defaultTheme;
      return <Component theme={theme} ref={innerRef || ref} {...other} />;
    });

    WithTheme.propTypes = {
      innerRef: chainPropTypes (
        PropTypes.oneOfType ([PropTypes.func, PropTypes.object]),
        props => {
          if (props.innerRef == null) {
            return null;
          }

          return new Error (
            'Diginet-Core-UI: The `innerRef` prop is deprecated and will be removed in v5. ' +
              'Refs are now automatically forwarded to the inner component.'
          );
        }
      ),
    };

    if (process.env.NODE_ENV !== 'production') {
      WithTheme.displayName = `WithTheme(${getDisplayName (Component)})`;
    }

    hoistNonReactStatics (WithTheme, Component);

    if (process.env.NODE_ENV !== 'production') {
      WithTheme.Naked = Component;
    }

    return WithTheme;
  };

  return withTheme;
};
const withTheme = withThemeCreator ();

export default withTheme;
