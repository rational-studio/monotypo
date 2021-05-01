import { MPackage } from '../../utils/MPackage';
import { BuildMode } from '../../utils/typings';
import { inspect } from 'util';
import { Worker } from 'worker_threads';

export function tscCompiler(
  project: MPackage,
  mode: BuildMode,
  outDir: string
) {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(__non_webpack_require__.resolve('./worker'), {
      workerData: {
        projectSourceDir: project.sourceDir,
        projectTempFolder: project.projectTempFolder,
        mode,
        outDir,
      },
    });
    worker.once('message', message => {
      if (message === 'success') {
        resolve();
      } else {
        reject('Emit Skipped');
      }
      worker.unref();
    });
  });
}
