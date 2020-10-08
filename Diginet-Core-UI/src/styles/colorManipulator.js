const clamp = (value, min = 0, max = 1) => {
  if (process.env.NODE_ENV !== 'production') {
    if (value < min || value > max) {
      console.error (
        `Diginet-Core-UI: The value provided ${value} is out of range [${min}, ${max}].`
      );
    }
  }

  return Math.min (Math.max (min, value), max);
};

export const hexToRgb = color => {
  color = color.substr (1);

  const re = new RegExp (`.{1,${color.length >= 6 ? 2 : 1}}`, 'g');
  let colors = color.match (re);

  if (colors && colors[0].length === 1) {
    colors = colors.map (n => n + n);
  }

  return colors
    ? `rgb${colors.length === 4 ? 'a' : ''}(${colors
        .map ((n, index) => {
          return index < 3 ? parseInt (n, 16) : Math.round (parseInt (n, 16) / 255 * 1000) / 1000;
        })
        .join (', ')})`
    : '';
};

const intToHex = int => {
  const hex = int.toString (16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export const rgbToHex = color => {
  if (color.indexOf ('#') === 0) {
    return color;
  }

  const {values} = decomposeColor (color);
  return `#${values.map (n => intToHex (n)).join ('')}`;
};

export const hslToRgb = color => {
  color = decomposeColor (color);
  const {values} = color;
  const h = values[0];
  const s = values[1] / 100;
  const l = values[2] / 100;
  const a = s * Math.min (l, 1 - l);
  const f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max (Math.min (k - 3, 9 - k, 1), -1);

  let type = 'rgb';
  const rgb = [
    Math.round (f (0) * 255),
    Math.round (f (8) * 255),
    Math.round (f (4) * 255),
  ];

  if (color.type === 'hsla') {
    type += 'a';
    rgb.push (values[3]);
  }

  return recomposeColor ({type, values: rgb});
};

export const decomposeColor = color => {
  if (color.type) {
    return color;
  }

  if (color.charAt (0) === '#') {
    return decomposeColor (hexToRgb (color));
  }

  const marker = color.indexOf ('(');
  const type = color.substring (0, marker);

  if (['rgb', 'rgba', 'hsl', 'hsla'].indexOf (type) === -1) {
    throw ('Diginet-Core-UI: Unsupported `%s` color.\n' +
      'We support the following formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla().', color);
  }

  let values = color.substring (marker + 1, color.length - 1).split (',');
  values = values.map (value => parseFloat (value));

  return {type, values};
};

export const recomposeColor = color => {
  const {type} = color;
  let {values} = color;

  if (type.indexOf ('rgb') !== -1) {
    // Only convert the first 3 values to int (i.e. not alpha)
    values = values.map ((n, i) => (i < 3 ? parseInt (n, 10) : n));
  } else if (type.indexOf ('hsl') !== -1) {
    values[1] = `${values[1]}%`;
    values[2] = `${values[2]}%`;
  }

  return `${type}(${values.join (', ')})`;
};

export const getContrastRatio = (foreground, background) => {
  const lumA = getLuminance (foreground);
  const lumB = getLuminance (background);
  return (Math.max (lumA, lumB) + 0.05) / (Math.min (lumA, lumB) + 0.05);
};

export const getLuminance = color => {
  color = decomposeColor (color);

  let rgb = color.type === 'hsl'
    ? decomposeColor (hslToRgb (color)).values
    : color.values;
  rgb = rgb.map (val => {
    val /= 255; // normalized
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  });

  // Truncate at 3 digits
  return Number (
    (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed (3)
  );
};

export const emphasize = (color, coefficient = 0.15) => {
  return getLuminance (color) > 0.5
    ? darken (color, coefficient)
    : lighten (color, coefficient);
};

export const fade = (color, value) => {
  color = decomposeColor (color);
  value = clamp (value);

  if (color.type === 'rgb' || color.type === 'hsl') {
    color.type += 'a';
  }
  color.values[3] = value;

  return recomposeColor (color);
};

export const darken = (color, coefficient) => {
  color = decomposeColor (color);
  coefficient = clamp (coefficient);

  if (color.type.indexOf ('hsl') !== -1) {
    color.values[2] *= 1 - coefficient;
  } else if (color.type.indexOf ('rgb') !== -1) {
    for (let i = 0; i < 3; i += 1) {
      color.values[i] *= 1 - coefficient;
    }
  }
  return recomposeColor (color);
};

export const lighten = (color, coefficient) => {
  color = decomposeColor (color);
  coefficient = clamp (coefficient);

  if (color.type.indexOf ('hsl') !== -1) {
    color.values[2] += (100 - color.values[2]) * coefficient;
  } else if (color.type.indexOf ('rgb') !== -1) {
    for (let i = 0; i < 3; i += 1) {
      color.values[i] += (255 - color.values[i]) * coefficient;
    }
  }

  return recomposeColor (color);
};
