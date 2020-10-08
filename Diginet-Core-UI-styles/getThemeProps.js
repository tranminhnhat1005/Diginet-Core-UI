const getThemeProps = params => {
  const {theme, name, props} = params;

  if (!theme || !theme.props || !theme.props[name]) {
    return props;
  }

  const defaultProps = theme.props[name];
  let propName;

  for (propName in defaultProps) {
    if (props[propName] === undefined) {
      props[propName] = defaultProps[propName];
    }
  }

  return props;
};

export default getThemeProps;
