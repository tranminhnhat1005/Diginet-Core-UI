import {ForwardRef, Memo} from 'react-is';

const fnNameMatchRegex = /^\s*function(?:\s|\s*\/\*.*\*\/\s*)+([^(\s/]*)\s*/;
export const getFunctionName = fn => {
  const match = `${fn}`.match (fnNameMatchRegex);
  const name = match && match[1];
  return name || '';
};

const getFunctionComponentName = (Component, fallback = '') => {
  return (
    Component.displayName ||
    Component.name ||
    getFunctionName (Component) ||
    fallback
  );
};

const getWrappedName = (outerType, innerType, wrapperName) => {
  const functionName = getFunctionComponentName (innerType);
  return (
    outerType.displayName ||
    (functionName !== '' ? `${wrapperName}(${functionName})` : wrapperName)
  );
};

const getDisplayName = Component => {
  if (Component == null) {
    return undefined;
  }

  if (typeof Component === 'string') {
    return Component;
  }

  if (typeof Component === 'function') {
    return getFunctionComponentName (Component, 'Component');
  }

  if (typeof Component === 'object') {
    switch (Component.$$typeof) {
      case ForwardRef:
        return getWrappedName (Component, Component.render, 'ForwardRef');
      case Memo:
        return getWrappedName (Component, Component.type, 'memo');
      default:
        return undefined;
    }
  }

  return undefined;
};

export default getDisplayName;
