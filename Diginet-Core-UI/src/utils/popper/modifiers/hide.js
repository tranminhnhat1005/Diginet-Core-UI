import {top, bottom, left, right} from '../enums.js';
import detectOverflow from '../utils/detectOverflow.js';

function getSideOffsets (
  overflow,
  rect,
  preventedOffsets = {
    x: 0,
    y: 0,
  }
) {
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x,
  };
}

function isAnySideFullyClipped (overflow) {
  return [top, right, bottom, left].some (side => overflow[side] >= 0);
}

function hide({state, name}) {
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const preventedOffsets = state.modifiersData.preventOverflow;
  const referenceOverflow = detectOverflow (state, {
    elementContext: 'reference',
  });
  const popperAltOverflow = detectOverflow (state, {
    altBoundary: true,
  });
  const referenceClippingOffsets = getSideOffsets (
    referenceOverflow,
    referenceRect
  );
  const popperEscapeOffsets = getSideOffsets (
    popperAltOverflow,
    popperRect,
    preventedOffsets
  );
  const isReferenceHidden = isAnySideFullyClipped (referenceClippingOffsets);
  const hasPopperEscaped = isAnySideFullyClipped (popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped,
  };
  state.attributes.popper = Object.assign ({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped,
  });
} // eslint-disable-next-line import/no-unused-modules

export default {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide,
};
