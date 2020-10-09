import computeOffsets from '../utils/computeOffsets.js';

function popperOffsets({state, name}) {
  state.modifiersData[name] = computeOffsets ({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement,
  });
} // eslint-disable-next-line import/no-unused-modules

export default {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {},
};
