import * as cpy from 'cpy';
import { tscCompiler } from '../interDist/tsc';
import { MPackage } from '../utils/MPackage';
import { BuildMode } from '../utils/typings';
import * as path from 'path';

interface InterDistOptions {
  copyAssets?: boolean;
  compiler?: 'tsc' | 'swc';
  errorTolerant?: boolean;
}

function assetsCopy(
  project: MPackage,
  destination: string,
  assetsMatchPattern = '*.{eot,ttf,woff,woff2,png,jpg,jpeg,gif,svg,mp4,webm,scss}'
): Promise<string[]> {
  return cpy(
    [path.join('.', '**', assetsMatchPattern)],
    path.relative(project.sourceDir, destination),
    {
      cwd: project.sourceDir,
      parents: true,
    }
  );
}

export async function buildInterDist(
  project: MPackage,
  mode: BuildMode,
  {
    copyAssets = false,
    compiler = 'tsc',
    errorTolerant = false,
  }: InterDistOptions = {}
) {
  // Use TypeScript compiler for now
  if (compiler === 'tsc') {
    await Promise.all([
      tscCompiler(project, mode, project.interDistDir, errorTolerant),
      assetsCopy(project, project.interDistDir),
    ]);
  } else {
    throw new Error('SWC Compiler is not implemented.');
  }
}
