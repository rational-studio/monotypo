import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';
import { initWebpackConfig } from '../compilers/webpack';
import { MPackage } from '../utils/MPackage';
import { BuildMode } from '../utils/typings';
import * as process from 'process';

export function spawnWebpackDevServer(
  project: MPackage,
  mode: BuildMode,
  entry: string
) {
  const isDevMode = mode === 'development';
  const config = initWebpackConfig(project, mode, entry);
  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: process.env.BACKEND_PROXY,
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
      },
    },
    disableHostCheck: true,
    https: process.env.HTTPS ? true : false,
    historyApiFallback: {
      verbose: true,
    },
    hot: isDevMode,
    open: true,
  });
  return server;
}
