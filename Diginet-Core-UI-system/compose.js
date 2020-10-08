import merge from './merge';

const compose = (...styles) => {
  const fn = props =>
    styles.reduce ((acc, style) => {
      const output = style (props);

      if (output) {
        return merge (acc, output);
      }

      return acc;
    }, {});

  fn.propTypes = process.env.NODE_ENV !== 'production'
    ? styles.reduce ((acc, style) => Object.assign (acc, style.propTypes), {})
    : {};

  fn.filterProps = styles.reduce (
    (acc, style) => acc.concat (style.filterProps),
    []
  );

  return fn;
};

export default compose;
