import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

import config from './config';
import {timeoutsShape} from '../../utils/react-transition-group/PropTypes';
import TransitionGroupContext from './TransitionGroupContext';

export const UNMOUNTED = 'unmounted';
export const EXITED = 'exited';
export const ENTERING = 'entering';
export const ENTERED = 'entered';
export const EXITING = 'exiting';

class Transition extends React.Component {
  static contextType = TransitionGroupContext;

  constructor (props, context) {
    super (props, context);

    let parentGroup = context;
    let appear = parentGroup && !parentGroup.isMounting
      ? props.enter
      : props.appear;

    let initialStatus;

    this.appearStatus = null;

    if (props.in) {
      if (appear) {
        initialStatus = EXITED;
        this.appearStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    this.state = {status: initialStatus};

    this.nextCallback = null;
  }

  static getDerivedStateFromProps ({in: nextIn}, prevState) {
    if (nextIn && prevState.status === UNMOUNTED) {
      return {status: EXITED};
    }
    return null;
  }

  componentDidMount () {
    this.updateStatus (true, this.appearStatus);
  }

  componentDidUpdate (prevProps) {
    let nextStatus = null;
    if (prevProps !== this.props) {
      const {status} = this.state;

      if (this.props.in) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }
    this.updateStatus (false, nextStatus);
  }

  componentWillUnmount () {
    this.cancelNextCallback ();
  }

  getTimeouts () {
    const {timeout} = this.props;
    let exit, enter, appear;

    exit = enter = appear = timeout;

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit;
      enter = timeout.enter;
      // TODO: remove fallback for next major
      appear = timeout.appear !== undefined ? timeout.appear : enter;
    }
    return {exit, enter, appear};
  }

  updateStatus (mounting = false, nextStatus) {
    if (nextStatus !== null) {
      this.cancelNextCallback ();

      if (nextStatus === ENTERING) {
        this.performEnter (mounting);
      } else {
        this.performExit ();
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState ({status: UNMOUNTED});
    }
  }

  performEnter (mounting) {
    const {enter} = this.props;
    const appearing = this.context ? this.context.isMounting : mounting;
    const [maybeNode, maybeAppearing] = this.props.nodeRef
      ? [appearing]
      : [ReactDOM.findDOMNode (this), appearing];

    const timeouts = this.getTimeouts ();
    const enterTimeout = appearing ? timeouts.appear : timeouts.enter;
    if ((!mounting && !enter) || config.disabled) {
      this.safeSetState ({status: ENTERED}, () => {
        this.props.onEntered (maybeNode);
      });
      return;
    }

    this.props.onEnter (maybeNode, maybeAppearing);

    this.safeSetState ({status: ENTERING}, () => {
      this.props.onEntering (maybeNode, maybeAppearing);

      this.onTransitionEnd (enterTimeout, () => {
        this.safeSetState ({status: ENTERED}, () => {
          this.props.onEntered (maybeNode, maybeAppearing);
        });
      });
    });
  }

  performExit () {
    const {exit} = this.props;
    const timeouts = this.getTimeouts ();
    const maybeNode = this.props.nodeRef
      ? undefined
      : ReactDOM.findDOMNode (this);

    // no exit animation skip right to EXITED
    if (!exit || config.disabled) {
      this.safeSetState ({status: EXITED}, () => {
        this.props.onExited (maybeNode);
      });
      return;
    }

    this.props.onExit (maybeNode);

    this.safeSetState ({status: EXITING}, () => {
      this.props.onExiting (maybeNode);

      this.onTransitionEnd (timeouts.exit, () => {
        this.safeSetState ({status: EXITED}, () => {
          this.props.onExited (maybeNode);
        });
      });
    });
  }

  cancelNextCallback () {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel ();
      this.nextCallback = null;
    }
  }

  safeSetState (nextState, callback) {
    callback = this.setNextCallback (callback);
    this.setState (nextState, callback);
  }

  setNextCallback (callback) {
    let active = true;

    this.nextCallback = event => {
      if (active) {
        active = false;
        this.nextCallback = null;

        callback (event);
      }
    };

    this.nextCallback.cancel = () => {
      active = false;
    };

    return this.nextCallback;
  }

  onTransitionEnd (timeout, handler) {
    this.setNextCallback (handler);
    const node = this.props.nodeRef
      ? this.props.nodeRef.current
      : ReactDOM.findDOMNode (this);

    const doesNotHaveTimeoutOrListener =
      timeout == null && !this.props.addEndListener;
    if (!node || doesNotHaveTimeoutOrListener) {
      setTimeout (this.nextCallback, 0);
      return;
    }

    if (this.props.addEndListener) {
      const [maybeNode, maybeNextCallback] = this.props.nodeRef
        ? [this.nextCallback]
        : [node, this.nextCallback];
      this.props.addEndListener (maybeNode, maybeNextCallback);
    }

    if (timeout != null) {
      setTimeout (this.nextCallback, timeout);
    }
  }

  render () {
    const status = this.state.status;

    if (status === UNMOUNTED) {
      return null;
    }

    const {
      children,
      in: _in,
      mountOnEnter: _mountOnEnter,
      unmountOnExit: _unmountOnExit,
      appear: _appear,
      enter: _enter,
      exit: _exit,
      timeout: _timeout,
      addEndListener: _addEndListener,
      onEnter: _onEnter,
      onEntering: _onEntering,
      onEntered: _onEntered,
      onExit: _onExit,
      onExiting: _onExiting,
      onExited: _onExited,
      nodeRef: _nodeRef,
      ...childProps
    } = this.props;

    return (
      <TransitionGroupContext.Provider value={null}>
        {typeof children === 'function'
          ? children (status, childProps)
          : React.cloneElement (React.Children.only (children), childProps)}
      </TransitionGroupContext.Provider>
    );
  }
}

Transition.propTypes = {
  nodeRef: PropTypes.shape ({
    current: typeof Element === 'undefined'
      ? PropTypes.any
      : PropTypes.instanceOf (Element),
  }),
  children: PropTypes.oneOfType ([
    PropTypes.func.isRequired,
    PropTypes.element.isRequired,
  ]).isRequired,
  in: PropTypes.bool,
  mountOnEnter: PropTypes.bool,
  unmountOnExit: PropTypes.bool,
  appear: PropTypes.bool,
  enter: PropTypes.bool,
  exit: PropTypes.bool,
  timeout: (props, ...args) => {
    let pt = timeoutsShape;
    if (!props.addEndListener) pt = pt.isRequired;
    return pt (props, ...args);
  },
  addEndListener: PropTypes.func,
  onEnter: PropTypes.func,
  onEntering: PropTypes.func,
  onEntered: PropTypes.func,
  onExit: PropTypes.func,
  onExiting: PropTypes.func,
  onExited: PropTypes.func,
};

// Name the function so it is clearer in the documentation
const noop = () => {};

Transition.defaultProps = {
  in: false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,

  onEnter: noop,
  onEntering: noop,
  onEntered: noop,

  onExit: noop,
  onExiting: noop,
  onExited: noop,
};

Transition.UNMOUNTED = UNMOUNTED;
Transition.EXITED = EXITED;
Transition.ENTERING = ENTERING;
Transition.ENTERED = ENTERED;
Transition.EXITING = EXITING;

export default Transition;
