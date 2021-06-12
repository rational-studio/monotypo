import { Configuration } from 'webpack';
import { TraceAndMergeSourceMapPlugin } from './TraceAndMergeSourceMapPlugin';

export function getDevToolConfig(): Configuration {
  return {
    output: {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    },
    devtool: 'nosources-cheap-source-map',
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      sideEffects: false,
      usedExports: false,
      minimize: false,
    },
    plugins: [new TraceAndMergeSourceMapPlugin()],
  };
}
