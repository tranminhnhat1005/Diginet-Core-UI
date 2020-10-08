import {createContext} from 'react';

const ThemeContext = createContext (null);

if (process.env.NODE_ENV !== 'production') {
  ThemeContext.displayName = 'ThemeContext';
}

export default ThemeContext;
