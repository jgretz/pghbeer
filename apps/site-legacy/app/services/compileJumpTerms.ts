import * as R from 'ramda';

export function compileJumpNames(breweries: string[]) {
  return R.uniq(breweries.map((b) => b.substring(0, 1)));
}
