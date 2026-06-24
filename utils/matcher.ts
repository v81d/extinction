import picomatch from "picomatch";

export function isMatch(value: string, patterns: string[]) {
  const matcher = picomatch(patterns);
  return matcher(value);
}
