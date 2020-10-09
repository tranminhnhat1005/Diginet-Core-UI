// TODO v5: consider to make it private
const setRef = (ref, value) => {
  if (typeof ref === 'function') {
    ref (value);
  } else if (ref) {
    ref.current = value;
  }
};

export default setRef;
