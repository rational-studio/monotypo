export function verboseResolve(path: string) {
  const result = __non_webpack_require__.resolve(path);
  if (result) {
    return result;
  } else {
    throw new Error(`Module "${path}" cannot be found.`);
  }
}
