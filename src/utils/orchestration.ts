import { MPackage } from './MPackage';
import { parallelizeTasks } from './parallelism';
import { getPackageInfo } from './workspace';
import * as os from 'os';
import pLimit from 'p-limit';
import { BuildMode } from './typings';

const limit = pLimit(os.cpus().length);

export async function build(buildMode: BuildMode): Promise<void>;
export async function build(
  buildMode: BuildMode,
  entrypoint: MPackage
): Promise<void>;
export async function build(
  buildMode: BuildMode,
  entrypoint?: MPackage
): Promise<void> {
  const taskQueue = parallelizeTasks(
    ...(entrypoint ? [entrypoint] : Array.from(getPackageInfo().values()))
  );
  for (const tasks of taskQueue) {
    // TODO: Error handling
    await Promise.all(
      tasks.map(task =>
        limit(() =>
          task.isDepHashUnchanged ? Promise.resolve() : task.build(buildMode)
        )
      )
    );
  }
}
