import { CompilerOptions } from 'typescript';
import { MPackage } from '../utils/MPackage';

const enum HookCreatorType {
  Target,
  Extension,
}

const enum HookTargetType {
  TSConfig,
  WebpackConfig,
}

type HookItem<T> = {
  name: string;
  kind: HookCreatorType;
  hookTarget: HookTargetType;
  yield: T;
};
type Hook<T> = HookItem<T>[];

let tsConfigHooks: Hook<CompilerOptions> = [];

type HookCallback<T> = (project: MPackage) => T;

export function whenTsConfig(hookExecutor: () => CompilerOptions) {
  tsConfigHooks.push({
    name: 'aaa',
    kind: HookCreatorType.Target,
    hookTarget: HookTargetType.TSConfig,
    yield: hookExecutor(),
  });
}
