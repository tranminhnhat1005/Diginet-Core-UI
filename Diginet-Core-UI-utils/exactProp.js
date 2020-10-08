export const specialProperty = 'exact-prop: \u200b';

const exactProp = propTypes => {
  if (process.env.NODE_ENV === 'production') {
    return propTypes;
  }

  return {
    ...propTypes,
    [specialProperty]: props => {
      const unsupportedProps = Object.keys (props).filter (
        prop => !propTypes.hasOwnProperty (prop)
      );
      if (unsupportedProps.length > 0) {
        return new Error (
          `The following props are not supported: ${unsupportedProps
            .map (prop => `\`${prop}\``)
            .join (', ')}. Please remove them.`
        );
      }
      return null;
    },
  };
};

export default exactProp;
