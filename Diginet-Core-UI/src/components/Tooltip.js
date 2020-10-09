import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {deepMerge, elementAcceptingRef} from '../../../Diginet-Core-UI-utils';
import { alpha } from '../styles/colorManipulator';
import withStyles from '../styles/withStyles';
import Grow from './Grow';
import Popper from './Popper';
import {useControlled, useIsFocusVisible, useId, useForkRef, capitalize, setRef} from '../utils';
import useTheme from '../styles/useTheme';

const round = value => {
  return Math.round (value * 1e5) / 1e5;
};

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
});
