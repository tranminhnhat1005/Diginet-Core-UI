import {isShadowRoot} from './instanceOf.js';
export default function contains (parent, child) {
  const rootNode = child.getRootNode && child.getRootNode (); // First, attempt with faster native method

  if (parent.contains (child)) {
    return true;
  } else if (isShadowRoot (rootNode)) {
    // then fallback to custom implementation with Shadow DOM support
    let next = child;

    do {
      if (next && parent.isSameNode (next)) {
        return true;
      } // $FlowFixMe: need a better way to handle this...

      next = next.parentNode || next.host;
    } while (next);
  } // Give up, the result is false

  return false;
}
