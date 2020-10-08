/* eslint-disable react-hooks/rules-of-hooks */
import {useContext, useDebugValue, useEffect, useMemo, useRef} from 'react';
import {StylesContext} from '../StylesProvider';
import {getDynamicStyles} from '../../../../utils/Diginet-Core-UI/getDynamicStyles';
import getStylesCreator from '../getStylesCreator';
import {increment} from './indexCounter';
import mergeClasses from '../mergeClasses';
import multiKeyStore from './multiKeyStore';
import noopTheme from '../../../../utils/Diginet-Core-UI/noopTheme';
import useTheme from '../useTheme/useTheme';

const getClasses = ({state, stylesOptions}, classes, Component) => {
  if (stylesOptions.disableGeneration) {
    return classes || {};
  }

  if (!state.cacheClasses) {
    state.cacheClasses = {
      value: null,
      lastProp: null,
      lastJSS: {},
    };
  }

  let generate = false;

  if (state.classes !== state.cacheClasses.lastJSS) {
    state.cacheClasses.lastJSS = state.classes;
    generate = true;
  }
  if (classes !== state.cacheClasses.lastProp) {
    state.cacheClasses.lastProp = classes;
    generate = true;
  }

  if (generate) {
    state.cacheClasses.value = mergeClasses ({
      baseClasses: state.cacheClasses.lastJSS,
      newClasses: classes,
      Component,
    });
  }

  return state.cacheClasses.value;
};

const attach = ({state, theme, stylesOptions, stylesCreator, name}, props) => {
  if (stylesOptions.disableGeneration) {
    return;
  }

  let sheetManager = multiKeyStore.get (
    stylesOptions.sheetsManager,
    stylesCreator,
    theme
  );

  if (!sheetManager) {
    sheetManager = {
      refs: 0,
      staticSheet: null,
      dynamicStyles: null,
    };
    multiKeyStore.set (
      stylesOptions.sheetsManager,
      stylesCreator,
      theme,
      sheetManager
    );
  }

  const options = {
    ...stylesCreator.options,
    ...stylesOptions,
    theme,
    flip: typeof stylesOptions.flip === 'boolean'
      ? stylesOptions.flip
      : theme.direction === 'rtl',
  };
  options.generateId =
    options.serverGenerateClassName || options.generateClassName;

  const sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    let staticSheet;

    if (stylesOptions.sheetsCache) {
      staticSheet = multiKeyStore.get (
        stylesOptions.sheetsCache,
        stylesCreator,
        theme
      );
    }

    const styles = stylesCreator.create (theme, name);

    if (!staticSheet) {
      staticSheet = stylesOptions.jss.createStyleSheet (styles, {
        link: false,
        ...options,
      });
      staticSheet.attach ();

      if (stylesOptions.sheetsCache) {
        multiKeyStore.set (
          stylesOptions.sheetsCache,
          stylesCreator,
          theme,
          staticSheet
        );
      }
    }

    if (sheetsRegistry) {
      sheetsRegistry.add (staticSheet);
    }

    sheetManager.staticSheet = staticSheet;
    sheetManager.dynamicStyles = getDynamicStyles (styles);
  }

  if (sheetManager.dynamicStyles) {
    const dynamicSheet = stylesOptions.jss.createStyleSheet (
      sheetManager.dynamicStyles,
      {
        link: true,
        ...options,
      }
    );

    dynamicSheet.update (props);
    dynamicSheet.attach ();

    state.dynamicSheet = dynamicSheet;
    state.classes = mergeClasses ({
      baseClasses: sheetManager.staticSheet.classes,
      newClasses: dynamicSheet.classes,
    });

    if (sheetsRegistry) {
      sheetsRegistry.add (dynamicSheet);
    }
  } else {
    state.classes = sheetManager.staticSheet.classes;
  }

  sheetManager.refs += 1;
};

const update = ({state}, props) => {
  if (state.dynamicSheet) {
    state.dynamicSheet.update (props);
  }
};

const detach = ({state, theme, stylesOptions, stylesCreator}) => {
  if (stylesOptions.disableGeneration) {
    return;
  }

  const sheetManager = multiKeyStore.get (
    stylesOptions.sheetsManager,
    stylesCreator,
    theme
  );
  sheetManager.refs -= 1;
  const sheetsRegistry = stylesOptions.sheetsRegistry;

  if (sheetManager.refs === 0) {
    multiKeyStore.delete (stylesOptions.sheetsManager, stylesCreator, theme);
    stylesOptions.jss.removeStyleSheet (sheetManager.staticSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove (sheetManager.staticSheet);
    }
  }

  if (state.dynamicSheet) {
    stylesOptions.jss.removeStyleSheet (state.dynamicSheet);
    if (sheetsRegistry) {
      sheetsRegistry.remove (state.dynamicSheet);
    }
  }
};

const useSynchronousEffect = (func, values) => {
  const key = useRef ([]);
  let output;

  const currentKey = useMemo (() => ({}), values); // eslint-disable-line react-hooks/exhaustive-deps

  if (key.current !== currentKey) {
    key.current = currentKey;
    output = func ();
  }

  useEffect (
    () => () => {
      if (output) {
        output ();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentKey]
  );
};

const makeStyles = (stylesOrCreator, options = {}) => {
  const {
    name,
    classNamePrefix: classNamePrefixOption,
    Component,
    defaultTheme = noopTheme,
    ...stylesOptions2
  } = options;
  const stylesCreator = getStylesCreator (stylesOrCreator);
  const classNamePrefix = name || classNamePrefixOption || 'makeStyles';
  stylesCreator.options = {
    index: increment (),
    name,
    meta: classNamePrefix,
    classNamePrefix,
  };

  const useStyles = (props = {}) => {
    const theme = useTheme () || defaultTheme;
    const stylesOptions = {
      ...useContext (StylesContext),
      ...stylesOptions2,
    };

    const instance = useRef ();
    const shouldUpdate = useRef ();

    useSynchronousEffect (
      () => {
        const current = {
          name,
          state: {},
          stylesCreator,
          stylesOptions,
          theme,
        };

        attach (current, props);

        shouldUpdate.current = false;
        instance.current = current;
        return () => {
          detach (current);
        };
      },
      [theme, stylesCreator]
    );

    useEffect (() => {
      if (shouldUpdate.current) {
        update (instance.current, props);
      }
      shouldUpdate.current = true;
    });

    const classes = getClasses (instance.current, props.classes, Component);
    if (process.env.NODE_ENV !== 'production') {
      useDebugValue (classes);
    }

    return classes;
  };

  return useStyles;
};

export default makeStyles;
