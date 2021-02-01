import {
  CompilerOptions,
  JsxEmit,
  ModuleKind,
  ModuleResolutionKind,
  ScriptTarget,
} from 'typescript';

const base: CompilerOptions = {
  // TODO: base should not contain dom
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
  target: ScriptTarget.ES2015,
  module: ModuleKind.ESNext,
  moduleResolution: ModuleResolutionKind.NodeJs,
  strict: true,
  strictFunctionTypes: false,
  stripInternal: true,
  jsx: JsxEmit.React,
  forceConsistentCasingInFileNames: true,
  allowSyntheticDefaultImports: true,
  resolveJsonModule: true,
  sourceMap: true,
  skipLibCheck: true,
};

const deltaDev: CompilerOptions = {
  target: ScriptTarget.ES2020,
  declaration: true,
  declarationMap: true,
  incremental: true,
};

export const prod = base;
export const dev = Object.assign({}, base, deltaDev);
