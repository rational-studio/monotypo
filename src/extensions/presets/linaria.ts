import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import { Configuration } from 'webpack';
import { verboseResolve } from '../../utils/verbose';
import { Extension } from '../typings';

function getLinariaLoaderConfig(production: boolean): Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: verboseResolve('@linaria-webpack/loader'),
              options: {
                sourceMap: !production,
              },
            },
          ],
        },
      ],
    },
  };
}

export const linaria: Extension = {
  name: 'linaria',
  compilerSupported: ['webpack'],
  configs: {
    webpack: {
      development: getLinariaLoaderConfig(false),
      production: getLinariaLoaderConfig(true),
    },
  },
};
