import MiniCssExtractPlugin = require('mini-css-extract-plugin');
import { Configuration } from 'webpack';
import { verboseResolve } from '../../utils/verbose';
import { Extension } from '../typings';

function getSassLoaderConfig(production: boolean): Configuration {
  return {
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: verboseResolve('css-loader'),
              options: {
                modules: {
                  namedExport: true,
                  localIdentName: production
                    ? '[hash:base64]'
                    : '[path][name]__[local]',
                },
                importLoaders: 2,
              },
            },
            // {
            //   loader: 'postcss-loader',
            //   options: {
            //     postcssOptions: {
            //       plugins: [require('autoprefixer')],
            //     },
            //   },
            // },
            {
              loader: verboseResolve('sass-loader'),
            },
          ],
        },
      ],
    },
  };
}

export const sass: Extension = {
  name: 'sass',
  compilerSupported: ['webpack'],
  configs: {
    webpack: {
      development: getSassLoaderConfig(false),
      production: getSassLoaderConfig(true),
    },
  },
};
