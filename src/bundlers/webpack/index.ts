import { Bundler } from '../typings';
import * as path from 'path';
import { initWebpackCompiler, spawnWebpackDevServer } from './utils';
import { Command } from '../../commands/typings';

export const webpack: Bundler = {
  name: 'webpack',
  async bundle(project, mode) {
    return new Promise<void>((resolve, reject) => {
      const compiler = initWebpackCompiler(
        project,
        Command.Build,
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
  async watch(project, mode) {
    return new Promise<void>((resolve, reject) => {
      const server = spawnWebpackDevServer(
        project,
        mode,
        path.join(project.interDistDir, 'index.js')
      );
      server.listen(8080, error => {
        if (!error) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
  },
};
