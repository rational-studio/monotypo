import { Target } from '../typings';
import * as path from 'path';
import * as glob from 'glob';
import { swcCompiler } from '../compilers/swc';
import { initWebpackCompiler } from '../compilers/webpack';
import { tscCompiler } from '../compilers/tsc';
import * as fs from 'fs-extra';
import { inspect } from 'util';
import * as cpy from 'cpy';

const TEMP_TSC_DIST_DIR = 'webpack-tsc';

export const web: Target = {
  name: 'web',
  compilerUsed: ['webpack'],
  async build(project, mode) {
    // ***** SWC *****
    // const files = glob.sync(path.join(project.sourceDir, '**/*.{ts,tsx}'));
    // await Promise.all(
    //   files.map(filePath => () => swcCompiler(filePath, project))
    // );
    // ***** Webpack *****
    const tempTscDistDir = path.join(
      project.projectTempFolder,
      TEMP_TSC_DIST_DIR
    );

    await Promise.all([
      tscCompiler(project, mode, tempTscDistDir),
      cpy(
        [
          path.join(
            '.',
            '**',
            '*.{eot,ttf,woff,woff2,png,jpg,jpeg,gif,svg,mp4,webm,scss}'
          ),
        ],
        path.relative(project.sourceDir, tempTscDistDir),
        {
          cwd: project.sourceDir,
          parents: true,
        }
      ),
    ]);

    return new Promise<void>((resolve, reject) => {
      const compiler = initWebpackCompiler(
        project,
        mode,
        path.join(tempTscDistDir, 'index.js')
      );

      compiler.run((err, stats) => {
        const hasError = stats?.hasErrors() || false;
        if (err) {
          reject(err);
        } else if (hasError) {
          console.log(stats?.compilation.getErrors());
          // reject(compilationErrors);
        } else {
          // fs.writeFileSync(
          //   path.join(project.projectTempFolder, 'webpack-debug.log'),
          //   inspect(stats)
          // );
          resolve();
        }
      });
    });
  },
};
