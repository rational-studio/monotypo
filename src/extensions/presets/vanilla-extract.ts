import { Configuration } from 'webpack';
import { Extension } from '../typings';
import { VanillaExtractPlugin } from '@vanilla-extract/webpack-plugin';
import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import { verboseResolve } from '../../utils/verbose';

const vanillaExtractConfig: Configuration = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: verboseResolve('babel-loader'),
          options: {
            plugins: [verboseResolve('@vanilla-extract/babel-plugin')],
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, verboseResolve('css-loader')],
      },
    ],
  },
  plugins: [new VanillaExtractPlugin()],
};

export const vanillaExtract: Extension = {
  name: 'vanilla-extract',
  compilerSupported: ['webpack'],
  configs: {
    webpack: {
      development: vanillaExtractConfig,
      production: vanillaExtractConfig,
    },
  },
};
