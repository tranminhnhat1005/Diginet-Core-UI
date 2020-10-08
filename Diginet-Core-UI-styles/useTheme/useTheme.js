/* eslint-disable react-hooks/rules-of-hooks */
import {useDebugValue, useContext} from 'react';
import ThemeContext from './ThemeContext';

const useTheme = () => {
  const theme = useContext (ThemeContext);

  if (process.env.NODE_ENV !== 'production') {
    useDebugValue (theme);
  }

  return theme;
};
export default useTheme;
