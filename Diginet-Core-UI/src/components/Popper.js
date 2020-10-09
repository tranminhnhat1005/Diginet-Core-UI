import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useTheme} from '../../../Diginet-Core-UI-styles';
import {
  chainPropTypes,
  HTMLElementType,
  refType,
} from '../../../Diginet-Core-UI-utils';
import {createChainedFunction, setRef, useForkRef} from '../utils';
import PopperJs from '../utils/popper';
import Portal from './Portal';

const flipPlacement = (placement, theme) => {
  const direction = (theme && theme.direction) || 'ltr';

  if (direction === 'ltr') {
    return placement;
  }

  switch (placement) {
    case 'bottom-end':
      return 'bottom-start';
    case 'bottom-start':
      return 'bottom-end';
    case 'top-end':
      return 'top-start';
    case 'top-start':
      return 'top-end';
    default:
      return placement;
  }
};

const getAnchorEl = anchorEl => {
  return typeof anchorEl === 'function' ? anchorEl () : anchorEl;
};

const useEnhancedEffect = typeof window !== 'undefined'
  ? useLayoutEffect
  : useEffect;

const defaultPopperOptions = {};

const Popper = React.forwardRef (function Popper (props, ref) {
  const {
    anchorEl,
    children,
    container,
    disablePortal = false,
    keepMounted = false,
    modifiers,
    open,
    placement: initialPlacement = 'bottom',
    popperOptions = defaultPopperOptions,
    popperRef: popperRefProp,
    style,
    transition = false,
    ...other
  } = props;
  const tooltipRef = useRef (null);
  const ownRef = useForkRef (tooltipRef, ref);

  const popperRef = useRef (null);
  const handlePopperRef = useForkRef (popperRef, popperRefProp);
  const handlePopperRefRef = useRef (handlePopperRef);
  useEnhancedEffect (
    () => {
      handlePopperRefRef.current = handlePopperRef;
    },
    [handlePopperRef]
  );
  useImperativeHandle (popperRefProp, () => popperRef.current, []);

  const [exited, setExited] = useState (true);

  const theme = useTheme ();
  const rtlPlacement = flipPlacement (initialPlacement, theme);

  const [placement, setPlacement] = useState (rtlPlacement);

  useEffect (() => {
    if (popperRef.current) {
      popperRef.current.update ();
    }
  });

  const handleOpen = useCallback (
    () => {
      if (!tooltipRef.current || !anchorEl || !open) {
        return;
      }

      if (popperRef.current) {
        popperRef.current.destroy ();
        handlePopperRefRef.current (null);
      }

      const handlePopperUpdate = data => {
        setPlacement (data.placement);
      };

      const resolvedAnchorEl = getAnchorEl (anchorEl);

      if (process.env.NODE_ENV !== 'production') {
        if (resolvedAnchorEl && resolvedAnchorEl.nodeType === 1) {
          const box = resolvedAnchorEl.getBoundingClientRect ();

          if (
            process.env.NODE_ENV !== 'test' &&
            box.top === 0 &&
            box.left === 0 &&
            box.right === 0 &&
            box.bottom === 0
          ) {
            console.warn (
              [
                'Diginet-Core-UI: The `anchorEl` prop provided to the component is invalid.',
                'The anchor element should be part of the document layout.',
                "Make sure the element is present in the document or that it's not display none.",
              ].join ('\n')
            );
          }
        }
      }

      const popper = new PopperJs (getAnchorEl (anchorEl), tooltipRef.current, {
        placement: rtlPlacement,
        ...popperOptions,
        modifiers: {
          ...(disablePortal
            ? {}
            : {
                preventOverflow: {
                  boundariesElement: 'window',
                },
              }),
          ...modifiers,
          ...popperOptions.modifiers,
        },
        onCreate: createChainedFunction (
          handlePopperUpdate,
          popperOptions.onCreate
        ),
        onUpdate: createChainedFunction (
          handlePopperUpdate,
          popperOptions.onUpdate
        ),
      });

      handlePopperRefRef.current (popper);
    },
    [anchorEl, disablePortal, modifiers, open, rtlPlacement, popperOptions]
  );

  const handleRef = useCallback (
    node => {
      setRef (ownRef, node);
      handleOpen ();
    },
    [ownRef, handleOpen]
  );

  const handleEnter = () => {
    setExited (false);
  };

  const handleClose = () => {
    if (!popperRef.current) {
      return;
    }

    popperRef.current.destroy ();
    handlePopperRefRef.current (null);
  };

  const handleExited = () => {
    setExited (true);
    handleClose ();
  };

  useEffect (() => {
    return () => {
      handleClose ();
    };
  }, []);

  useEffect (
    () => {
      if (!open && !transition) {
        // Otherwise handleExited will call this.
        handleClose ();
      }
    },
    [open, transition]
  );

  if (!keepMounted && !open && (!transition || exited)) {
    return null;
  }

  const childProps = {placement};

  if (transition) {
    childProps.TransitionProps = {
      in: open,
      onEnter: handleEnter,
      onExited: handleExited,
    };
  }

  return (
    <Portal disablePortal={disablePortal} container={container}>
      <div
        ref={handleRef}
        role="tooltip"
        {...other}
        style={{
          // Prevents scroll issue, waiting for Popper.js to add this style once initiated.
          position: 'fixed',
          // Fix Popper.js display issue
          top: 0,
          left: 0,
          display: !open && keepMounted && !transition ? 'none' : null,
          ...style,
        }}
      >
        {typeof children === 'function' ? children (childProps) : children}
      </div>
    </Portal>
  );
});

Popper.propTypes = {
  anchorEl: chainPropTypes (
    PropTypes.oneOfType ([HTMLElementType, PropTypes.object, PropTypes.func]),
    props => {
      if (props.open) {
        const resolvedAnchorEl = getAnchorEl (props.anchorEl);

        if (resolvedAnchorEl && resolvedAnchorEl.nodeType === 1) {
          const box = resolvedAnchorEl.getBoundingClientRect ();

          if (
            process.env.NODE_ENV !== 'test' &&
            box.top === 0 &&
            box.left === 0 &&
            box.right === 0 &&
            box.bottom === 0
          ) {
            return new Error (
              [
                'Diginet-Core-UI: The `anchorEl` prop provided to the component is invalid.',
                'The anchor element should be part of the document layout.',
                "Make sure the element is present in the document or that it's not display none.",
              ].join ('\n')
            );
          }
        } else if (
          !resolvedAnchorEl ||
          typeof resolvedAnchorEl.clientWidth !== 'number' ||
          typeof resolvedAnchorEl.clientHeight !== 'number' ||
          typeof resolvedAnchorEl.getBoundingClientRect !== 'function'
        ) {
          return new Error (
            [
              'Diginet-Core-UI: The `anchorEl` prop provided to the component is invalid.',
              'It should be an HTML element instance or a referenceObject ',
              '(https://popper.js.org/docs/v1/#referenceObject).',
            ].join ('\n')
          );
        }
      }

      return null;
    }
  ),
  children: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType ([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  container: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType ([
    HTMLElementType,
    PropTypes.instanceOf (React.Component),
    PropTypes.func,
  ]),
  disablePortal: PropTypes.bool,
  keepMounted: PropTypes.bool,
  modifiers: PropTypes.object,
  open: PropTypes.bool.isRequired,
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
  popperOptions: PropTypes.object,
  popperRef: refType,
  style: PropTypes.object,
  transition: PropTypes.bool,
};

export default Popper;
