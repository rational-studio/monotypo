import * as cpy from 'cpy';
import { tscCompiler } from '../compilers/tsc';
import { MPackage } from './MPackage';
import { BuildMode } from './typings';
import * as path from 'path';

interface InterDistOptions {
  copyAssets?: boolean;
  experimentalCompiler?: 'swc' | 'esbuild';
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
  { copyAssets = false }: InterDistOptions = {}
) {
  // Use TypeScript compiler for now
  await Promise.all([
    tscCompiler(project, mode, project.interDistDir),
    assetsCopy(project, project.interDistDir),
  ]);
}
