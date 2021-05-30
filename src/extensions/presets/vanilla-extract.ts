import { Configuration } from 'webpack';
import { Extension } from '../typings';

const vanillaExtractConfig: Configuration = {
  plugins: [],
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
