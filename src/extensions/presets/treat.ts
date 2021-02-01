import { Configuration } from 'webpack';
import { Extension } from '../typings';
import { TreatPlugin } from 'treat/webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const treatConfig: Configuration = {
  plugins: [
    new TreatPlugin({
      outputLoaders: [MiniCssExtractPlugin.loader],
    }),
  ],
};

export const treat: Extension = {
  name: 'treat',
  compilerSupported: ['webpack'],
  configs: {
    webpack: {
      development: treatConfig,
      production: treatConfig,
    },
  },
};
