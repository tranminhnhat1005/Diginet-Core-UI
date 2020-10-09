import React from 'react';
import PropTypes from 'prop-types';
import {exactProp} from '../Diginet-Core-UI-utils';
import createGenerateClassName from './createGenerateClassName';
import {create} from 'jss';
import jssPreset from './jssPreset';

const jss = create (jssPreset ());

const generateClassName = createGenerateClassName ();

export const sheetsManager = new Map ();

const defaultOptions = {
  disableGeneration: false,
  generateClassName,
  jss,
  sheetsCache: null,
  sheetsManager,
  sheetsRegistry: null,
};

export const StylesContext = React.createContext (defaultOptions);

if (process.env.NODE_ENV !== 'production') {
  StylesContext.displayName = 'StylesContext';
}

let injectFirstNode;

const StylesProvider = props => {
  const {
    children,
    injectFirst = false,
    disableGeneration = false,
    ...localOptions
  } = props;

  const outerOptions = React.useContext (StylesContext);
  const context = {...outerOptions, disableGeneration, ...localOptions};

  if (process.env.NODE_ENV !== 'production') {
    if (typeof window === 'undefined' && !context.sheetsManager) {
      console.error (
        'Diginet-Core-UI: You need to use the ServerStyleSheets API when rendering on the server.'
      );
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (context.jss.options.insertionPoint && injectFirst) {
      console.error (
        'Diginet-Core-UI: You cannot use a custom insertionPoint and <StylesContext injectFirst> at the same time.'
      );
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (injectFirst && localOptions.jss) {
      console.error (
        'Diginet-Core-UI: You cannot use the jss and injectFirst props at the same time.'
      );
    }
  }

  if (
    !context.jss.options.insertionPoint &&
    injectFirst &&
    typeof window !== 'undefined'
  ) {
    if (!injectFirstNode) {
      const head = document.head;
      injectFirstNode = document.createComment ('dcui-inject-first');
      head.insertBefore (injectFirstNode, head.firstChild);
    }

    context.jss = create ({
      plugins: jssPreset ().plugins,
      insertionPoint: injectFirstNode,
    });
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
  jss: PropTypes.object,
  serverGenerateClassName: PropTypes.func,
  sheetsCache: PropTypes.object,
  sheetsManager: PropTypes.object,
  sheetsRegistry: PropTypes.object,
};

if (process.env.NODE_ENV !== 'production') {
  StylesProvider.propTypes = exactProp (StylesProvider.propTypes);
}
