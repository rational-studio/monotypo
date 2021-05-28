import { Bundler } from '../typings';
import { copy } from 'fs-extra';
import { watch } from 'chokidar';
import { MPackage } from '../../utils/MPackage';

function copyInterDist(project: MPackage) {
  return copy(project.interDistDir, project.distributionDir);
}

export const none: Bundler = {
  name: 'none',
  bundle(project, mode) {
    return copyInterDist(project);
  },
  async watch(project, mode) {
    await copyInterDist(project);
    const watcher = watch(project.interDistDir);
    watcher.on('change', () => {
      copyInterDist(project);
    });
  },
};
