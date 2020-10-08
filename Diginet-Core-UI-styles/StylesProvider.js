import React from 'react';
import PropTypes from 'prop-types';
import {exactProp} from '../../../utils/Diginet-Core-UI/exactProp';
import createGenerateClassName
  from './createGenerateClassName';

const generateClassName = createGenerateClassName ();

export const sheetsManager = new Map ();

const defaultOptions = {
  disableGeneration: false,
  generateClassName,
  sheetsCache: null,
  sheetsManager,
  sheetsRegistry: null,
};

export const StylesContext = React.createContext (defaultOptions);

if (process.env.NODE_ENV !== 'production') {
  StylesContext.displayName = 'StylesContext';
}

const StylesProvider = props => {
  const {children, disableGeneration = false, ...localOptions} = props;

  const outerOptions = React.useContext (StylesContext);
  const context = {...outerOptions, disableGeneration, ...localOptions};

  if (process.env.NODE_ENV !== 'production') {
    if (typeof window === 'undefined' && !context.sheetsManager) {
      console.error (
        'Diginet-Core-UI: You need to use the ServerStyleSheets API when rendering on the server.'
      );
    }
  }

  return (
    <StylesContext.Provider value={context}>{children}</StylesContext.Provider>
  );
};
export default StylesProvider;
StylesProvider.propTypes = {
  children: PropTypes.node.isRequired,
  disableGeneration: PropTypes.bool,
  generateClassName: PropTypes.func,
  injectFirst: PropTypes.bool,
  serverGenerateClassName: PropTypes.func,
  sheetsCache: PropTypes.object,
  sheetsManager: PropTypes.object,
  sheetsRegistry: PropTypes.object,
};

if (process.env.NODE_ENV !== 'production') {
  StylesProvider.propTypes = exactProp (StylesProvider.propTypes);
}
