import { inspect } from 'util';
import { MPackage } from './MPackage';
import { parallelizeTasks } from './parallelism';
import { getPackageInfo } from './workspace';

export function getTaskQueue(target?: string) {
  const packageInfo = getPackageInfo();
  if (target) {
    const pkg = packageInfo.get(target);
    if (pkg) {
      return parallelizeTasks(pkg);
    } else {
      throw new Error(`Target Package "${target}" is not valid.`);
    }
  } else {
    return parallelizeTasks(...Array.from(packageInfo.values()));
  }
}

export function stripTaskQueueWithoutConfig(taskQueue: MPackage[][]) {
  return taskQueue
    .map(items => items.filter(item => item.isMConfigExisted))
    .filter(items => items.length > 0);
}
