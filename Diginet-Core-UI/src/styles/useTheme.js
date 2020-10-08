import {
  useTheme as useThemeWithoutDefault,
} from '../../../Diginet-Core-UI-styles';
import {useDebugValue} from 'react';
import defaultTheme from './defaultTheme';

const useTheme = () => {
  const theme = useThemeWithoutDefault () || defaultTheme;

  if (process.env.NODE_ENV !== 'production') {
    useDebugValue (theme);
  }

  return theme;
};

export default useTheme;
