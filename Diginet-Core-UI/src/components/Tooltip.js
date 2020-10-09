import clsx from 'clsx';
import PropTypes from 'prop-types';
import React, {
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import ReactDOM from 'react-dom';
import {deepMerge, elementAcceptingRef} from '../../../Diginet-Core-UI-utils';
import {alpha} from '../styles/colorManipulator';
import {useTheme, withStyles} from '../styles';
import {
  capitalize,
  round,
  setRef,
  useControlled,
  useForkRef,
  useId,
  useIsFocusVisible,
} from '../utils';
import Grow from './Grow';
import Popper from './Popper';

const arrowGenerator = () => {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '0 100%',
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.71em',
      marginLeft: 4,
      marginRight: 4,
      '&::before': {
        transformOrigin: '100% 0',
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.71em',
      height: '1em',
      width: '0.71em',
      marginTop: 4,
      marginBottom: 4,
      '&::before': {
        transformOrigin: '100% 100%',
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.71em',
      height: '1em',
      width: '0.71em',
      marginTop: 4,
      marginBottom: 4,
      '&::before': {
        transformOrigin: '0 0',
      },
    },
  };
};

export const styles = theme => ({
  popper: {
    zIndex: theme.zIndex.tooltip,
    pointerEvents: 'none', // disable jss-rtl plugin
  },
  popperInteractive: {
    pointerEvents: 'auto',
  },
  popperArrow: arrowGenerator (),
  tooltip: {
    backgroundColor: alpha (theme.palette.grey[700], 0.9),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.common.white,
    fontFamily: theme.typography.fontFamily,
    padding: '4px 8px',
    fontSize: theme.typography.pxToRem (10),
    lineHeight: `${round (14 / 10)}em`,
    maxWidth: 300,
    wordWrap: 'break-word',
    fontWeight: theme.typography.fontWeightMedium,
  },
  tooltipArrow: {
    position: 'relative',
    margin: '0',
  },
  arrow: {
    overflow: 'hidden',
    position: 'absolute',
    width: '1em',
    height: '0.71em' /* = width / sqrt(2) = (length of the hypotenuse) */,
    boxSizing: 'border-box',
    color: alpha (theme.palette.grey[700], 0.9),
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: '100%',
      height: '100%',
      backgroundColor: 'currentColor',
      transform: 'rotate(45deg)',
    },
  },
  touch: {
    padding: '8px 16px',
    fontSize: theme.typography.pxToRem (14),
    lineHeight: `${round (16 / 14)}em`,
    fontWeight: theme.typography.fontWeightRegular,
  },
  tooltipPlacementLeft: {
    transformOrigin: 'right center',
    margin: '0 24px ',
    [theme.breakpoints.up ('sm')]: {
      margin: '0 14px',
    },
  },
  tooltipPlacementRight: {
    transformOrigin: 'left center',
    margin: '0 24px',
    [theme.breakpoints.up ('sm')]: {
      margin: '0 14px',
    },
  },
  tooltipPlacementTop: {
    transformOrigin: 'center bottom',
    margin: '24px 0',
    [theme.breakpoints.up ('sm')]: {
      margin: '14px 0',
    },
  },
  tooltipPlacementBottom: {
    transformOrigin: 'center top',
    margin: '24px 0',
    [theme.breakpoints.up ('sm')]: {
      margin: '14px 0',
    },
  },
});

let hystersisOpen = false;
let hystersisTimer = null;

export function testReset () {
  hystersisOpen = false;
  clearTimeout (hystersisTimer);
}

const Tooltip = React.forwardRef (function Tooltip (props, ref) {
  const {
    arrow = false,
    children,
    classes,
    disableFocusListener = false,
    disableHoverListener = false,
    disableTouchListener = false,
    enterDelay = 100,
    enterNextDelay = 0,
    enterTouchDelay = 700,
    id: idProp,
    interactive = false,
    leaveDelay = 0,
    leaveTouchDelay = 1500,
    onClose,
    onOpen,
    open: openProp,
    placement = 'bottom',
    PopperComponent = Popper,
    PopperProps,
    title,
    TransitionComponent = Grow,
    TransitionProps,
    ...other
  } = props;
  const theme = useTheme ();

  const [childNode, setChildNode] = useState ();
  const [arrowRef, setArrowRef] = useState (null);
  const ignoreNonTouchEvents = useRef (false);

  const closeTimer = useRef ();
  const enterTimer = useRef ();
  const leaveTimer = useRef ();
  const touchTimer = useRef ();

  const [openState, setOpenState] = useControlled ({
    controlled: openProp,
    default: false,
    name: 'Tooltip',
    state: 'open',
  });

  let open = openState;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {current: isControlled} = useRef (openProp !== undefined);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect (
      () => {
        if (
          childNode &&
          childNode.disabled &&
          !isControlled &&
          title !== '' &&
          childNode.tagName.toLowerCase () === 'button'
        ) {
          console.error (
            [
              'Diginet-Core-UI: You are providing a disabled `button` child to the Tooltip component.',
              'A disabled element does not fire events.',
              "Tooltip needs to listen to the child element's events to display the title.",
              '',
              'Add a simple wrapper element, such as a `span`.',
            ].join ('\n')
          );
        }
      },
      [title, childNode, isControlled]
    );
  }

  const id = useId (idProp);

  useEffect (() => {
    return () => {
      clearTimeout (closeTimer.current);
      clearTimeout (enterTimer.current);
      clearTimeout (leaveTimer.current);
      clearTimeout (touchTimer.current);
    };
  }, []);

  const handleOpen = event => {
    clearTimeout (hystersisTimer);
    hystersisOpen = true;

    setOpenState (true);

    if (onOpen) {
      onOpen (event);
    }
  };

  const handleEnter = (forward = true) => event => {
    const childrenProps = children.props;

    if (event.type === 'mouseover' && childrenProps.onMouseOver && forward) {
      childrenProps.onMouseOver (event);
    }

    if (ignoreNonTouchEvents.current && event.type !== 'touchstart') {
      return;
    }
    if (childNode) {
      childNode.removeAttribute ('title');
    }

    clearTimeout (enterTimer.current);
    clearTimeout (leaveTimer.current);
    if (enterDelay || (hystersisOpen && enterNextDelay)) {
      event.persist ();
      enterTimer.current = setTimeout (() => {
        handleOpen (event);
      }, hystersisOpen ? enterNextDelay : enterDelay);
    } else {
      handleOpen (event);
    }
  };

  const {
    isFocusVisible,
    onBlurVisible,
    ref: focusVisibleRef,
  } = useIsFocusVisible ();
  const [childIsFocusVisible, setChildIsFocusVisible] = useState (false);
  const handleBlur = () => {
    if (childIsFocusVisible) {
      setChildIsFocusVisible (false);
      onBlurVisible ();
    }
  };

  const handleFocus = (forward = true) => event => {
    // Workaround for https://github.com/facebook/react/issues/7769
    // The autoFocus of React might trigger the event before the componentDidMount.
    // We need to account for this eventuality.
    if (!childNode) {
      setChildNode (event.currentTarget);
    }

    if (isFocusVisible (event)) {
      setChildIsFocusVisible (true);
      handleEnter () (event);
    }

    const childrenProps = children.props;
    if (childrenProps.onFocus && forward) {
      childrenProps.onFocus (event);
    }
  };

  const handleClose = event => {
    clearTimeout (hystersisTimer);
    hystersisTimer = setTimeout (() => {
      hystersisOpen = false;
    }, 800 + leaveDelay);
    setOpenState (false);

    if (onClose) {
      onClose (event);
    }

    clearTimeout (closeTimer.current);
    closeTimer.current = setTimeout (() => {
      ignoreNonTouchEvents.current = false;
    }, theme.transitions.duration.shortest);
  };

  const handleLeave = (forward = true) => event => {
    const childrenProps = children.props;

    if (event.type === 'blur') {
      if (childrenProps.onBlur && forward) {
        childrenProps.onBlur (event);
      }
      handleBlur ();
    }

    if (
      event.type === 'mouseleave' &&
      childrenProps.onMouseLeave &&
      event.currentTarget === childNode
    ) {
      childrenProps.onMouseLeave (event);
    }

    clearTimeout (enterTimer.current);
    clearTimeout (leaveTimer.current);
    event.persist ();
    leaveTimer.current = setTimeout (() => {
      handleClose (event);
    }, leaveDelay);
  };

  const detectTouchStart = event => {
    ignoreNonTouchEvents.current = true;

    const childrenProps = children.props;
    if (childrenProps.onTouchStart) {
      childrenProps.onTouchStart (event);
    }
  };

  const handleTouchStart = event => {
    detectTouchStart (event);
    clearTimeout (leaveTimer.current);
    clearTimeout (closeTimer.current);
    clearTimeout (touchTimer.current);
    event.persist ();
    touchTimer.current = setTimeout (() => {
      handleEnter () (event);
    }, enterTouchDelay);
  };

  const handleTouchEnd = event => {
    if (children.props.onTouchEnd) {
      children.props.onTouchEnd (event);
    }

    clearTimeout (touchTimer.current);
    clearTimeout (leaveTimer.current);
    event.persist ();
    leaveTimer.current = setTimeout (() => {
      handleClose (event);
    }, leaveTouchDelay);
  };

  const handleUseRef = useForkRef (setChildNode, ref);
  const handleFocusRef = useForkRef (focusVisibleRef, handleUseRef);
  // can be removed once we drop support for non ref forwarding class components
  const handleOwnRef = useCallback (
    instance => {
      // #StrictMode ready
      setRef (handleFocusRef, ReactDOM.findDOMNode (instance));
    },
    [handleFocusRef]
  );

  const handleRef = useForkRef (children.ref, handleOwnRef);

  // There is no point in displaying an empty tooltip.
  if (title === '') {
    open = false;
  }

  const shouldShowNativeTitle = !open && !disableHoverListener;
  const childrenProps = {
    'aria-describedby': open ? id : null,
    title: shouldShowNativeTitle && typeof title === 'string' ? title : null,
    ...other,
    ...children.props,
    className: clsx (other.className, children.props.className),
    onTouchStart: detectTouchStart,
    ref: handleRef,
  };

  const interactiveWrapperListeners = {};

  if (!disableTouchListener) {
    childrenProps.onTouchStart = handleTouchStart;
    childrenProps.onTouchEnd = handleTouchEnd;
  }

  if (!disableHoverListener) {
    childrenProps.onMouseOver = handleEnter ();
    childrenProps.onMouseLeave = handleLeave ();

    if (interactive) {
      interactiveWrapperListeners.onMouseOver = handleEnter (false);
      interactiveWrapperListeners.onMouseLeave = handleLeave (false);
    }
  }

  if (!disableFocusListener) {
    childrenProps.onFocus = handleFocus ();
    childrenProps.onBlur = handleLeave ();

    if (interactive) {
      interactiveWrapperListeners.onFocus = handleFocus (false);
      interactiveWrapperListeners.onBlur = handleLeave (false);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (children.props.title) {
      console.error (
        [
          'Diginet-Core-UI: You have provided a `title` prop to the child of <Tooltip />.',
          `Remove this title prop \`${children.props.title}\` or the Tooltip component.`,
        ].join ('\n')
      );
    }
  }

  const mergedPopperProps = useMemo (
    () => {
      return deepMerge (
        {
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean (arrowRef),
                element: arrowRef,
              },
            },
          },
        },
        PopperProps
      );
    },
    [arrowRef, PopperProps]
  );

  return (
    <React.Fragment>
      {cloneElement (children, childrenProps)}
      <PopperComponent
        className={clsx (classes.popper, {
          [classes.popperInteractive]: interactive,
          [classes.popperArrow]: arrow,
        })}
        placement={placement}
        anchorEl={childNode}
        open={childNode ? open : false}
        id={childrenProps['aria-describedby']}
        transition
        {...interactiveWrapperListeners}
        {...mergedPopperProps}
      >
        {({
          placement: placementInner,
          TransitionProps: TransitionPropsInner,
        }) => (
          <TransitionComponent
            timeout={theme.transitions.duration.shorter}
            {...TransitionPropsInner}
            {...TransitionProps}
          >
            <div
              className={clsx (
                classes.tooltip,
                {
                  [classes.touch]: ignoreNonTouchEvents.current,
                  [classes.tooltipArrow]: arrow,
                },
                classes[
                  `tooltipPlacement${capitalize (placementInner.split ('-')[0])}`
                ]
              )}
            >
              {title}
              {arrow
                ? <span className={classes.arrow} ref={setArrowRef} />
                : null}
            </div>
          </TransitionComponent>
        )}
      </PopperComponent>
    </React.Fragment>
  );
});

Tooltip.propTypes = {
  arrow: PropTypes.bool,
  children: elementAcceptingRef.isRequired,
  classes: PropTypes.object,
  className: PropTypes.string,
  disableFocusListener: PropTypes.bool,
  disableHoverListener: PropTypes.bool,
  disableTouchListener: PropTypes.bool,
  enterDelay: PropTypes.number,
  enterNextDelay: PropTypes.number,
  enterTouchDelay: PropTypes.number,
  id: PropTypes.string,
  interactive: PropTypes.bool,
  leaveDelay: PropTypes.number,
  leaveTouchDelay: PropTypes.number,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  open: PropTypes.bool,
  placement: PropTypes.oneOf ([
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  PopperComponent: PropTypes.elementType,
  PopperProps: PropTypes.object,
  title: PropTypes /* @typescript-to-proptypes-ignore */.node.isRequired,
  TransitionComponent: PropTypes.elementType,
  TransitionProps: PropTypes.object,
};

export default withStyles (styles, {name: 'DCUITooltip', flip: false}) (
  Tooltip
);
