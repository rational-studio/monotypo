import findRoot = require('find-root');
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import * as webpack from 'webpack';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { MPackage } from '../../../utils/MPackage';
import * as path from 'path';
import { pluginManager } from '../../../utils/pluginManager';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { BuildMode } from '../../../utils/typings';

const { inspect } = require('util');

export function initWebpackCompiler(
  project: MPackage,
  mode: BuildMode,
  entry: string
) {
  const isProduction = mode === 'production';
  const initialConfig: Configuration = {
    mode,
    stats: 'errors-warnings',
    context: findRoot(__dirname),
    entry,
    output: {
      path: project.distributionDir,
      filename: isProduction ? '[contenthash].js' : '[name].js',
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
          loader: require.resolve('file-loader'),
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
      new HtmlWebpackPlugin({
        template: 'index.html',
        minify: {
          collapseWhitespace: isProduction,
          minifyJS: isProduction,
        },
      }),
    ],
  };

  // TODO: Resolve this from m.config.json
  const sass = pluginManager.resolveExtension('sass', 'webpack');
  const treat = pluginManager.resolveExtension('treat', 'webpack');

  const finalConfig = merge(
    initialConfig,
    sass.configs.webpack?.development ?? {},
    treat.configs.webpack?.development ?? {}
  );

  return webpack(finalConfig);
}
