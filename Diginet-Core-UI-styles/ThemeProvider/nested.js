const hasSymbol = typeof Symbol === 'function' && Symbol.for;

export default (hasSymbol ? Symbol.for ('dcui.nested') : '__THEME_NESTED__');
