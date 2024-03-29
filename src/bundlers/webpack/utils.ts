import findRoot = require('find-root');
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import * as webpack from 'webpack';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { MPackage } from '../../utils/MPackage';
import * as path from 'path';
import { pluginManager } from '../../utils/pluginManager';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { BuildMode } from '../../utils/typings';
import * as process from 'process';
import * as ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import * as WebpackDevServer from 'webpack-dev-server';
import { Command } from '../../commands/typings';
import { getDevToolConfig } from './devtoolConfig';
import { verboseResolve } from '../../utils/verbose';

const { inspect } = require('util');

export function initWebpackConfig(
  project: MPackage,
  command: Command,
  mode: BuildMode,
  entry: string
): webpack.Configuration {
  const isProduction = mode === 'production';
  const applyFastRefresh = !isProduction && command === Command.Watch && false;
  const initialConfig: Configuration = {
    mode,
    stats: 'errors-warnings',
    context: findRoot(process.cwd()),
    entry,
    output: {
      path: project.distributionDir,
      filename: isProduction ? '[contenthash].js' : '[name].js',
      publicPath: '/',
    },
    resolve: {
      fallback: {
        assert: false,
        buffer: false,
      },
    },
    devtool: 'cheap-source-map',
    cache: {
      type: 'filesystem',
      cacheDirectory: path.join(project.projectTempFolder, 'webpack-cache'),
    },
    module: {
      rules: [
        {
          test: /\.(eot|ttf|woff|woff2|png|jpe?g|gif|svg|mp4|webm)(\?.*)?$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? '[contenthash].css' : '[name].css',
        chunkFilename: isProduction ? '[contenthash].css' : '[id].css',
      }),
      new HtmlWebpackPlugin({
        templateContent: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>M</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`,
        minify: {
          collapseWhitespace: isProduction,
          minifyJS: isProduction,
        },
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.SUMMIT_TEST_ANON': JSON.stringify(
          process.env.SUMMIT_TEST_ANON
        ),
        'process.env.SUMMIT_TEST_URL': JSON.stringify(
          process.env.SUMMIT_TEST_URL
        ),
      }),
      ...(applyFastRefresh ? [new ReactRefreshWebpackPlugin()] : []),
    ],
  };

  // TODO: Resolve this from m.config.json
  const linaria = pluginManager.resolveExtension('linaria', 'webpack');
  const finalConfig = merge(
    initialConfig,
    linaria.configs.webpack?.development ?? {}
  );

  return finalConfig;
}

export function initWebpackCompiler(
  project: MPackage,
  command: Command,
  mode: BuildMode,
  entry: string
) {
  return webpack(initWebpackConfig(project, command, mode, entry));
}

export function spawnWebpackDevServer(
  project: MPackage,
  mode: BuildMode,
  entry: string,
  preciseSourceMap: boolean
) {
  const isDevMode = mode === 'development';
  const config = merge(
    initWebpackConfig(project, Command.Watch, mode, entry),
    preciseSourceMap ? getDevToolConfig() : {}
  );
  const compiler = webpack(config);
  const server = new WebpackDevServer(
    {
      host: '0.0.0.0',
      port: 8080,
      proxy: {
        '/api': {
          target: process.env.BACKEND_PROXY,
          pathRewrite: { '^/api': '' },
          changeOrigin: true,
        },
      },
      allowedHosts: 'all',
      https: process.env.HTTPS ? true : false,
      client: {
        overlay: {
          warnings: false,
          errors: true,
        },
      },
      historyApiFallback: {
        verbose: true,
      },
      hot: isDevMode,
    },
    compiler
  );
  return server;
}
