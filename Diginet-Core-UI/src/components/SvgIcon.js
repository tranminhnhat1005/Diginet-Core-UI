import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import withStyles from '../styles/withStyles';
import capitalize from '../utils/capitalize';

export const styles = theme => ({
  root: {
    userSelect: 'none',
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fill: 'currentColor',
    flexShrink: 0,
    fontSize: theme.typography.pxToRem (24),
    transition: theme.transitions.create ('fill', {
      duration: theme.transitions.duration.shorter,
    }),
  },
  colorPrimary: {
    color: theme.palette.primary.main,
  },
  colorSecondary: {
    color: theme.palette.secondary.main,
  },
  colorAction: {
    color: theme.palette.action.active,
  },
  colorError: {
    color: theme.palette.error.main,
  },
  colorDisabled: {
    color: theme.palette.action.disabled,
  },
  fontSizeInherit: {
    fontSize: 'inherit',
  },
  fontSizeSmall: {
    fontSize: theme.typography.pxToRem (20),
  },
  fontSizeLarge: {
    fontSize: theme.typography.pxToRem (35),
  },
});

const SvgIcon = React.forwardRef (function SvgIcon (props, ref) {
  const {
    children,
    classes,
    className,
    color = 'inherit',
    component: Component = 'svg',
    fontSize = 'default',
    htmlColor,
    titleAccess,
    viewBox = '0 0 24 24',
    ...other
  } = props;

  return (
    <Component
      className={clsx (
        classes.root,
        {
          [classes[`color${capitalize (color)}`]]: color !== 'inherit',
          [classes[`fontSize${capitalize (fontSize)}`]]: fontSize !== 'default',
        },
        className
      )}
      focusable="false"
      viewBox={viewBox}
      color={htmlColor}
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? 'img' : undefined}
      ref={ref}
      {...other}
    >
      {children}
      {titleAccess ? <title>{titleAccess}</title> : null}
    </Component>
  );
});

SvgIcon.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  color: PropTypes.oneOf ([
    'action',
    'disabled',
    'error',
    'inherit',
    'primary',
    'secondary',
  ]),
  component: PropTypes.elementType,
  fontSize: PropTypes.oneOf (['default', 'inherit', 'large', 'small']),
  htmlColor: PropTypes.string,
  shapeRendering: PropTypes.string,
  titleAccess: PropTypes.string,
  viewBox: PropTypes.string,
};

SvgIcon.dcuiName = 'SvgIcon';

export default withStyles (styles, {name: 'DCUISvgIcon'}) (SvgIcon);
