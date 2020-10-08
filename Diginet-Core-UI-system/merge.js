import {deepMerge} from '../Diginet-Core-UI-utils/deepMerge';

function merge (acc, item) {
  if (!item) {
    return acc;
  }

  return deepMerge (acc, item, {
    clone: false, // No need to clone deep, it's way faster.
  });
}

export default merge;
