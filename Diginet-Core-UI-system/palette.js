import style from './style';
import compose from './compose';

export const color = style ({
  prop: 'color',
  themeKey: 'palette',
});

export const bgColor = style ({
  prop: 'bgColor',
  cssProperty: 'backgroundColor',
  themeKey: 'palette',
});

const palette = compose (color, bgColor);

export default palette;
