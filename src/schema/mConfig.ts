import * as t from 'typanion';

const isTarget = t.isEnum(['web', 'library', 'node']);
const isExtensions = t.isArray(t.isString());
const isEnv = t.isDict(t.isOneOf([t.isString(), t.isNumber(), t.isBoolean()]));

export const isValidMConfig = t.isObject({
  target: isTarget,
  extensions: isExtensions,
  env: isEnv,
});
