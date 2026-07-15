// Babel's legacy decorator transform (used for this JS-only project) does not
// support decorators on function parameters, unlike TypeScript's compiler.
// TypeScript itself applies parameter decorators by calling the decorator
// factory imperatively as `decorator(target, key, index)` — this helper does
// the same so we can use Nest's @Body()/@Param()/@Query()/etc. decorators
// without `@` syntax on parameters.
export function bindParams(Target, methodName, decoratorsByIndex) {
  for (const [index, decorator] of Object.entries(decoratorsByIndex)) {
    decorator(Target.prototype, methodName, Number(index));
  }
}
