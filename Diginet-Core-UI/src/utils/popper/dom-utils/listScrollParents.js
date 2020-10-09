import getScrollParent from './getScrollParent.js';
import getParentNode from './getParentNode.js';
import getNodeName from './getNodeName.js';
import getWindow from './getWindow.js';
import isScrollParent from './isScrollParent.js';
/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the 
reference element's position.
*/

export default function listScrollParents (element, list = []) {
  const scrollParent = getScrollParent (element);
  const isBody = getNodeName (scrollParent) === 'body';
  const win = getWindow (scrollParent);
  const target = isBody
    ? [win].concat (
        win.visualViewport || [],
        isScrollParent (scrollParent) ? scrollParent : []
      )
    : scrollParent;
  const updatedList = list.concat (target);
  return isBody
    ? updatedList // $FlowFixMe: isBody tells us target will be an HTMLElement here
    : updatedList.concat (listScrollParents (getParentNode (target)));
}