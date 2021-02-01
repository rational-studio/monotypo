import color = require('tinycolor2');

function hash(str: string) {
  let hash = 55949,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}

export function generateColor(uid: string) {
  const n = hash(uid);
  return color({ h: n % 360, s: 0.85, l: 0.7 });
}

export function generateGradient(uid: string) {
  const c1 = generateColor(uid);
  const c2 = c1.tetrad()[1];
  return [c2.toHexString(), c1.toHexString()];
}
