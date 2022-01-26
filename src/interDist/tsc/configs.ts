import {
  CompilerOptions,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';
import { ValidMConfig } from '../../utils/MPackage';
import { BuildMode } from '../../utils/typings';

const base: CompilerOptions = {
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
  target: ScriptTarget.ES2020,
  module: ModuleKind.ES2020,
  moduleResolution: ModuleResolutionKind.NodeJs,
  strict: true,
  stripInternal: true,
  forceConsistentCasingInFileNames: true,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
  declaration: true,
  downlevelIteration: true,
  sourceMap: true,
  skipLibCheck: true,
};

const deltaDev: CompilerOptions = {
  target: ScriptTarget.ESNext,
  declarationMap: true,
  incremental: true,
};

function configureJSXEmit(config: ValidMConfig, mode: BuildMode): JsxEmit {
  switch (config.jsx) {
    case 'none':
      return JsxEmit.None;
    case 'react':
      return JsxEmit.React;
    case 'react-jsx':
      return mode === 'development' ? JsxEmit.ReactJSXDev : JsxEmit.ReactJSX;
  }
}

export function getProdConfig(config: ValidMConfig): CompilerOptions {
  const prodTsConfig = {
    ...base,
  };
  prodTsConfig.jsx = configureJSXEmit(config, 'production');
  return prodTsConfig;
}

export function getDevConfig(config: ValidMConfig): CompilerOptions {
  const devTsConfig = {
    ...base,
    ...deltaDev,
  };
  devTsConfig.jsx = configureJSXEmit(config, 'development');
  return devTsConfig;
}
