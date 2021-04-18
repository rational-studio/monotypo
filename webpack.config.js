const path = require('path');
const { BannerPlugin } = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './src/cli.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cli.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: '#!/usr/bin/env node',
      entryOnly: true,
      raw: true,
    }),
  ],
};
