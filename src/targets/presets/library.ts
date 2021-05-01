import { Target } from '../typings';
import { tscCompiler } from '../../compilers/tsc';
import { copy } from 'fs-extra';
export const library: Target = {
  name: 'library',
  build(project, mode) {
    return copy(project.interDistDir, project.distributionDir);
  },
};
