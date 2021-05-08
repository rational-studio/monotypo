import path from 'path';
import * as swc from '@swc/core';
import * as fs from 'fs-extra';
import { MPackage } from '../../utils/MPackage';

export async function swcCompiler(filePath: string, project: MPackage) {
  const { code, map } = await swc.transformFile(filePath, {
    jsc: {
      target: 'es5',
      parser: {
        syntax: 'typescript',
        tsx: true,
        dynamicImport: true,
      },
      externalHelpers: true,
    },
  });

  const relativePath = path.relative(project.sourceDir, filePath);
  const destPath = path.join(project.distributionDir, relativePath);
  const parsedDestPath = path.parse(destPath);

  if (parsedDestPath.ext === '.ts' || parsedDestPath.ext === '.tsx') {
    parsedDestPath.ext = '.js';
    parsedDestPath.base = parsedDestPath.name + parsedDestPath.ext;
  }

  const finalPath = path.format(parsedDestPath);

  await fs.ensureFile(finalPath);
  return await fs.writeFile(finalPath, code);
}
