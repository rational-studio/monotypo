import { Target } from '../typings';
import * as path from 'path';
import { initWebpackCompiler } from '../../compilers/webpack';

export const web: Target = {
  name: 'web',
  async build(project, mode) {
    return new Promise<void>((resolve, reject) => {
      const compiler = initWebpackCompiler(
        project,
        mode,
        path.join(project.interDistDir, 'index.js')
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
