import { Target } from '../typings';
import { tscCompiler } from '../compilers/tsc';
import * as cpy from 'cpy';
import * as path from 'path';
export const library: Target = {
  name: 'library',
  compilerUsed: ['tsc'],
  async build(project, mode) {
    await Promise.all([
      tscCompiler(project, mode, project.distributionDir),
      cpy(
        [
          path.join(
            '.',
            '**',
            '*.{eot,ttf,woff,woff2,png,jpg,jpeg,gif,svg,mp4,webm,scss}'
          ),
        ],
        path.relative(project.sourceDir, project.distributionDir),
        {
          cwd: project.sourceDir,
          parents: true,
        }
      ),
    ]);
  },
};
