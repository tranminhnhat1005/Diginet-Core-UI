// based on https://github.com/WICG/focus-visible/blob/v4.1.5/src/focus-visible.js
import {useCallback, useDebugValue} from 'react';
import * as ReactDOM from 'react-dom';

let hadKeyboardEvent = true;
let hadFocusVisibleRecently = false;
let hadFocusVisibleRecentlyTimeout = null;

const inputTypesWhitelist = {
  text: true,
  search: true,
  url: true,
  tel: true,
  email: true,
  password: true,
  number: true,
  date: true,
  month: true,
  week: true,
  time: true,
  dateTime: true,
  'dateTime-local': true,
};

const focusTriggersKeyboardModality = node => {
  const {type, tagName} = node;

  if (tagName === 'INPUT' && inputTypesWhitelist[type] && !node.readOnly) {
    return true;
  }

  if (tagName === 'TEXTAREA' && !node.readOnly) {
    return true;
  }

  if (node.isContentEditable) {
    return true;
  }

  return false;
};

const handleKeyDown = event => {
  if (event.metaKey || event.altKey || event.ctrlKey) {
    return;
  }
  hadKeyboardEvent = true;
};

const handlePointerDown = () => {
  hadKeyboardEvent = false;
};

const handleVisibilityChange = () => {
  if (this.visibilityState === 'hidden') {
    if (hadFocusVisibleRecently) {
      hadKeyboardEvent = true;
    }
  }
};

const prepare = doc => {
  doc.addEventListener ('keydown', handleKeyDown, true);
  doc.addEventListener ('mousedown', handlePointerDown, true);
  doc.addEventListener ('pointerdown', handlePointerDown, true);
  doc.addEventListener ('touchstart', handlePointerDown, true);
  doc.addEventListener ('visibilityChange', handleVisibilityChange, true);
};

export const teardown = doc => {
  doc.removeEventListener ('keydown', handleKeyDown, true);
  doc.removeEventListener ('mousedown', handlePointerDown, true);
  doc.removeEventListener ('pointerdown', handlePointerDown, true);
  doc.removeEventListener ('touchstart', handlePointerDown, true);
  doc.removeEventListener ('visibilityChange', handleVisibilityChange, true);
};

const isFocusVisible = event => {
  const {target} = event;
  try {
    return target.matches (':focus-visible');
  } catch (error) {}

  return hadKeyboardEvent || focusTriggersKeyboardModality (target);
};

const handleBlurVisible = () => {
  hadFocusVisibleRecently = true;
  window.clearTimeout (hadFocusVisibleRecentlyTimeout);
  hadFocusVisibleRecentlyTimeout = window.setTimeout (() => {
    hadFocusVisibleRecently = false;
  }, 100);
};

const useIsFocusVisible = () => {
  const ref = useCallback (instance => {
    const node = ReactDOM.findDOMNode (instance);
    if (node != null) {
      prepare (node.ownerDocument);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    useDebugValue (isFocusVisible);
  }

  return {isFocusVisible, onBlurVisible: handleBlurVisible, ref};
};

export default useIsFocusVisible;
