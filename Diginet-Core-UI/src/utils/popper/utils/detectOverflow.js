import getBoundingClientRect from '../dom-utils/getBoundingClientRect.js';
import getClippingRect from '../dom-utils/getClippingRect.js';
import getDocumentElement from '../dom-utils/getDocumentElement.js';
import computeOffsets from './computeOffsets.js';
import rectToClientRect from './rectToClientRect.js';
import {
  clippingParents,
  reference,
  popper,
  bottom,
  top,
  right,
  basePlacements,
  viewport,
} from '../enums.js';
import {isElement} from '../dom-utils/instanceOf.js';
import mergePaddingObject from './mergePaddingObject.js';
import expandToHashMap from './expandToHashMap.js'; // eslint-disable-next-line import/no-unused-modules

export default function detectOverflow (state, options = {}) {
  const {
    placement = state.placement,
    boundary = clippingParents,
    rootBoundary = viewport,
    elementContext = popper,
    altBoundary = false,
    padding = 0,
  } = options;
  const paddingObject = mergePaddingObject (
    typeof padding !== 'number'
      ? padding
      : expandToHashMap (padding, basePlacements)
  );
  const altContext = elementContext === popper ? reference : popper;
  const referenceElement = state.elements.reference;
  const popperRect = state.rects.popper;
  const element = state.elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = getClippingRect (
    isElement (element)
      ? element
      : element.contextElement || getDocumentElement (state.elements.popper),
    boundary,
    rootBoundary
  );
  const referenceClientRect = getBoundingClientRect (referenceElement);
  const popperOffsets = computeOffsets ({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement,
  });
  const popperClientRect = rectToClientRect (
    Object.assign ({}, popperRect, popperOffsets)
  );
  const elementClientRect = elementContext === popper
    ? popperClientRect
    : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  const overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom -
      clippingClientRect.bottom +
      paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right -
      clippingClientRect.right +
      paddingObject.right,
  };
  const offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    const offset = offsetData[placement];
    Object.keys (overflowOffsets).forEach (key => {
      const multiply = [right, bottom].indexOf (key) >= 0 ? 1 : -1;
      const axis = [top, bottom].indexOf (key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}
