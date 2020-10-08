/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics
  from '../../../utils/Diginet-Core-UI/hoistNonReactStatics';
import {chainPropTypes} from '../../../utils/Diginet-Core-UI/chainPropTypes';
import {getDisplayName} from '../../../utils/Diginet-Core-UI/getDisplayName';
import makeStyles from './makeStyles/makeStyles';
import getThemeProps from './getThemeProps';
import useTheme from './useTheme/useTheme';

const withStyles = (stylesOrCreator, options = {}) => Component => {
  const {defaultTheme, withTheme = false, name, ...stylesOptions} = options;

  if (process.env.NODE_ENV !== 'production') {
    if (Component === undefined) {
      throw new Error (
        [
          'You are calling withStyles(styles)(Component) with an undefined component.',
          'You may have forgotten to import it.',
        ].join ('\n')
      );
    }
  }

  let classNamePrefix = name;

  if (process.env.NODE_ENV !== 'production') {
    if (!name) {
      // Provide a better DX outside production.
      const displayName = getDisplayName (Component);
      if (displayName !== undefined) {
        classNamePrefix = displayName;
      }
    }
  }

  const useStyles = makeStyles (stylesOrCreator, {
    defaultTheme,
    Component,
    name: name || Component.displayName,
    classNamePrefix,
    ...stylesOptions,
  });

  const WithStyles = React.forwardRef (function WithStyles (props, ref) {
    const {classes: classesProp, innerRef, ...other} = props;
    const classes = useStyles ({...Component.defaultProps, ...props});

    let theme;
    let more = other;

    if (typeof name === 'string' || withTheme) {
      theme = useTheme () || defaultTheme;

      if (name) {
        more = getThemeProps ({theme, name, props: other});
      }

      if (withTheme && !more.theme) {
        more.theme = theme;
      }
    }

    return <Component ref={innerRef || ref} classes={classes} {...more} />;
  });

  WithStyles.propTypes = {
    classes: PropTypes.object,
    innerRef: chainPropTypes (
      PropTypes.oneOfType ([PropTypes.func, PropTypes.object]),
      props => {
        if (props.innerRef == null) {
          return null;
        }

        return null;
      }
    ),
  };

  if (process.env.NODE_ENV !== 'production') {
    WithStyles.displayName = `WithStyles(${getDisplayName (Component)})`;
  }

  hoistNonReactStatics (WithStyles, Component);

  if (process.env.NODE_ENV !== 'production') {
    // Exposed for test purposes.
    WithStyles.Naked = Component;
    WithStyles.options = options;
    WithStyles.useStyles = useStyles;
  }

  return WithStyles;
};

export default withStyles;
