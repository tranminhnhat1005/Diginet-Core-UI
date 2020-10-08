import {formatMs} from '../utils/formatMillisecond';
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

export const duration = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195,
};

export default {
  easing,
  duration,
  create: (props = ['all'], options = {}) => {
    const {
      duration: durationOption = duration.standard,
      easing: easingOption = easing.easeInOut,
      delay = 0,
      ...other
    } = options;

    if (process.env.NODE_ENV !== 'production') {
      const isString = value => typeof value === 'string';
      const isNumber = value => !isNaN (parseFloat (value));
      if (!isString (props) && !Array.isArray (props)) {
        console.error (
          'Diginet-Core-UI: Argument "props" must be a string or Array.'
        );
      }

      if (!isNumber (durationOption) && !isString (durationOption)) {
        console.error (
          `Diginet-Core-UI: Argument "duration" must be a number or a string but found ${durationOption}.`
        );
      }

      if (!isString (easingOption)) {
        console.error ('Diginet-Core-UI: Argument "easing" must be a string.');
      }

      if (!isNumber (delay) && !isString (delay)) {
        console.error (
          'Diginet-Core-UI: Argument "delay" must be a number or a string.'
        );
      }

      if (Object.keys (other).length !== 0) {
        console.error (
          `Diginet-Core-UI: Unrecognized argument(s) [${Object.keys (other).join (',')}].`
        );
      }
    }

    return (Array.isArray (props) ? props : [props])
      .map (
        animatedProp =>
          `${animatedProp} ${typeof durationOption === 'string' ? durationOption : formatMs (durationOption)} ${easingOption} ${typeof delay === 'string' ? delay : formatMs (delay)}`
      )
      .join (',');
  },
  getAutoHeightDuration (height) {
    if (!height) {
      return 0;
    }

    const constant = height / 36;

    return Math.round ((4 + 15 * constant ** 0.25 + constant / 5) * 10);
  },
};
