export const reflow = node => node.scrollTop;

export const getTransitionProps = (props, options) => {
  const {timeout, style = {}} = props;

  return {
    duration: style.transitionDuration || typeof timeout === 'number'
      ? timeout
      : timeout[options.mode] || 0,
    delay: style.transitionDelay,
  };
};
