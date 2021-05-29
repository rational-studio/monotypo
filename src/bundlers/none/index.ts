import { Bundler } from '../typings';
import { copy } from 'fs-extra';
import { watch } from 'chokidar';
import { MPackage } from '../../utils/MPackage';

async function copyInterDist(project: MPackage) {
  try {
    return copy(project.interDistDir, project.distributionDir);
  } catch (err) {
    console.log('Failed to copy', err);
  }
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
