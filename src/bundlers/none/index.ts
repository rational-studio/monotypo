import { Bundler } from '../typings';
import { copy } from 'fs-extra';
export const none: Bundler = {
  name: 'none',
  bundle(project, mode) {
    return copy(project.interDistDir, project.distributionDir);
  },
  watch(project, mode) {
    return copy(project.interDistDir, project.distributionDir);
  },
};
