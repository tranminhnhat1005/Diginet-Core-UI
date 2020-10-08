export default (typeof window != 'undefined' && window.Math == Math
  ? window
  : typeof self != 'undefined' && self.Math == Math
      ? self
      : Function ('return this') ());
