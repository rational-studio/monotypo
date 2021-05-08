import * as t from 'typanion';

const isBundler = t.isEnum(['webpack', 'none']);
const isExtensions = t.isArray(t.isString());
const isEnv = t.isDict(t.isOneOf([t.isString(), t.isNumber(), t.isBoolean()]));
const isJSX = t.isEnum(['none', 'react', 'react-jsx']);

export const isValidMConfig = t.isObject({
  bundler: isBundler,
  jsx: isJSX,
  extensions: isExtensions,
  env: isEnv,
});
