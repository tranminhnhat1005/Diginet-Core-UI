let indexCounter = -1e9;

export const increment = () => {
  indexCounter += 1;

  if (process.env.NODE_ENV !== 'production') {
    if (indexCounter >= 0) {
      console.warn (
        [
          'Diginet-Core-UI: You might have a memory leak.',
          'The indexCounter is not supposed to grow that much.',
        ].join ('\n')
      );
    }
  }

  return indexCounter;
};
