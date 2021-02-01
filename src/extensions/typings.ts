import { Configuration as WebpackConfiguration } from 'webpack';
import { Compiler } from '../utils/typings';

export interface Extension {
  name: string;
  compilerSupported: readonly Compiler[] | '*';
  configs: {
    [K in Compiler]?: {
      development: K extends 'webpack' ? WebpackConfiguration : unknown;
      production: K extends 'webpack' ? WebpackConfiguration : unknown;
    };
  };
}
