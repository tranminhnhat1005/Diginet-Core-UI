import PropTypes from 'prop-types';
import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import * as ReactDOM from 'react-dom';
import {exactProp, HTMLElementType} from '../../../Diginet-Core-UI-utils';
import {setRef, useForkRef} from '../utils';

function getContainer (container) {
  container = typeof container === 'function' ? container () : container;
  // #StrictMode ready
  return ReactDOM.findDOMNode (container);
}

const useEnhancedEffect = typeof window !== 'undefined'
  ? useLayoutEffect
  : useEffect;

const Portal = React.forwardRef (function Portal (props, ref) {
  const {children, container, disablePortal = false, onRendered} = props;
  const [mountNode, setMountNode] = useState (null);
  const handleRef = useForkRef (
    isValidElement (children) ? children.ref : null,
    ref
  );

  useEnhancedEffect (
    () => {
      if (!disablePortal) {
        setMountNode (getContainer (container) || document.body);
      }
    },
    [container, disablePortal]
  );

  useEnhancedEffect (
    () => {
      if (mountNode && !disablePortal) {
        setRef (ref, mountNode);
        return () => {
          setRef (ref, null);
        };
      }

      return undefined;
    },
    [ref, mountNode, disablePortal]
  );

  useEnhancedEffect (
    () => {
      if (onRendered && (mountNode || disablePortal)) {
        onRendered ();
      }
    },
    [onRendered, mountNode, disablePortal]
  );

  if (disablePortal) {
    if (isValidElement (children)) {
      return cloneElement (children, {
        ref: handleRef,
      });
    }
    return children;
  }

  return mountNode ? ReactDOM.createPortal (children, mountNode) : mountNode;
});

Portal.propTypes = {
  children: PropTypes.node,
  container: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType ([
    HTMLElementType,
    PropTypes.instanceOf (React.Component),
    PropTypes.func,
  ]),
  disablePortal: PropTypes.bool,
  onRendered: PropTypes.func,
};

if (process.env.NODE_ENV !== 'production') {
  Portal['propTypes' + ''] = exactProp (Portal.propTypes);
}

export default Portal;
