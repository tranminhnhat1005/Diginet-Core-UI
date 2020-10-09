import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import Transition from '../styles/react-transition-group/Transition';
import useTheme from '../styles/useTheme';
import {reflow, getTransitionProps} from './transitions/utils';
import useForkRef from '../utils/useForkRef';

const getScale = value => {
  return `scale(${value}, ${value ** 2})`;
};

const styles = {
  entering: {
    opacity: 1,
    transform: getScale (1),
  },
  entered: {
    opacity: 1,
    transform: 'none',
  },
};

const Grow = React.forwardRef (function Grow (props, ref) {
  const {
    children,
    disableStrictModeCompat = false,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = 'auto',
    TransitionComponent = Transition,
    ...other
  } = props;
  const timer = useRef ();
  const autoTimeout = useRef ();
  const theme = useTheme ();

  const enableStrictModeCompat =
    theme.unstable_strictMode && !disableStrictModeCompat;
  const nodeRef = useRef (null);
  const foreignRef = useForkRef (children.ref, ref);
  const handleRef = useForkRef (
    enableStrictModeCompat ? nodeRef : undefined,
    foreignRef
  );

  const normalizedTransitionCallback = callback => (
    nodeOrAppearing,
    maybeAppearing
  ) => {
    if (callback) {
      const [node, isAppearing] = enableStrictModeCompat
        ? [nodeRef.current, nodeOrAppearing]
        : [nodeOrAppearing, maybeAppearing];

      if (isAppearing === undefined) {
        callback (node);
      } else {
        callback (node, isAppearing);
      }
    }
  };

  const handleEntering = normalizedTransitionCallback (onEntering);

  const handleEnter = normalizedTransitionCallback ((node, isAppearing) => {
    reflow (node); // So the animation always start from the start.

    const {duration: transitionDuration, delay} = getTransitionProps (
      {style, timeout},
      {
        mode: 'enter',
      }
    );

    let duration;
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration (node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    node.style.transition = [
      theme.transitions.create ('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create ('transform', {
        duration: duration * 0.666,
        delay,
      }),
    ].join (',');

    if (onEnter) {
      onEnter (node, isAppearing);
    }
  });

  const handleEntered = normalizedTransitionCallback (onEntered);

  const handleExiting = normalizedTransitionCallback (onExiting);

  const handleExit = normalizedTransitionCallback (node => {
    const {duration: transitionDuration, delay} = getTransitionProps (
      {style, timeout},
      {
        mode: 'exit',
      }
    );

    let duration;
    if (timeout === 'auto') {
      duration = theme.transitions.getAutoHeightDuration (node.clientHeight);
      autoTimeout.current = duration;
    } else {
      duration = transitionDuration;
    }

    node.style.transition = [
      theme.transitions.create ('opacity', {
        duration,
        delay,
      }),
      theme.transitions.create ('transform', {
        duration: duration * 0.666,
        delay: delay || duration * 0.333,
      }),
    ].join (',');

    node.style.opacity = '0';
    node.style.transform = getScale (0.75);

    if (onExit) {
      onExit (node);
    }
  });

  const handleExited = normalizedTransitionCallback (onExited);

  const addEndListener = (nodeOrNext, maybeNext) => {
    const next = enableStrictModeCompat ? nodeOrNext : maybeNext;
    if (timeout === 'auto') {
      timer.current = setTimeout (next, autoTimeout.current || 0);
    }
  };

  useEffect (() => {
    return () => {
      clearTimeout (timer.current);
    };
  }, []);

  return (
    <TransitionComponent
      appear
      in={inProp}
      nodeRef={enableStrictModeCompat ? nodeRef : undefined}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={addEndListener}
      timeout={timeout === 'auto' ? null : timeout}
      {...other}
    >
      {(state, childProps) => {
        return React.cloneElement (children, {
          style: {
            opacity: 0,
            transform: getScale (0.75),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
          ...childProps,
        });
      }}
    </TransitionComponent>
  );
});

Grow.propTypes = {
  children: PropTypes.element,
  disableStrictModeCompat: PropTypes.bool,
  in: PropTypes.bool,
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExit: PropTypes.func,
  onExited: PropTypes.func,
  onExiting: PropTypes.func,
  style: PropTypes.object,
  timeout: PropTypes.oneOfType ([
    PropTypes.oneOf (['auto']),
    PropTypes.number,
    PropTypes.shape ({
      appear: PropTypes.number,
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
};

Grow.dcuiSupportAuto = true;

export default Grow;
