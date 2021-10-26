import { Bundler } from '../typings';
import * as cpy from 'cpy';
import { watch } from 'chokidar';
import { MPackage } from '../../utils/MPackage';
import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs-extra';

interface RawSourceMap {
  version: number;
  sources: string[];
  names: string[];
  sourceRoot?: string;
  sourcesContent?: string[];
  mappings: string;
  file: string;
}

async function copyInterDist(project: MPackage) {
  try {
    await cpy(
      ['.', '!./**/*.map'],
      path.relative(project.interDistDir, project.distributionDir),
      { cwd: project.interDistDir, parents: true }
    );

    const interDistSourceMap = glob.sync(
      path.join(project.interDistDir, '**', '*.map')
    );

    // Rewrite Source Map Path
    for (const mapFile of interDistSourceMap) {
      const relativeToInterDist = path.relative(project.interDistDir, mapFile);

      const file = fs.readFileSync(mapFile, { encoding: 'utf8' });
      const map = JSON.parse(file) as RawSourceMap;
      map.sources = map.sources.map(source => {
        return path.relative(
          path.resolve(project.distributionDir),
          path.resolve(project.interDistDir, source)
        );
      });
      fs.ensureFileSync(
        path.join(project.distributionDir, relativeToInterDist)
      );
      fs.writeFileSync(
        path.join(project.distributionDir, relativeToInterDist),
        JSON.stringify(map)
      );
    }

    return;
  } catch (err) {
    console.log('Failed to copy', err);
  }
}

export const none: Bundler = {
  name: 'none',
  bundle(project, mode) {
    return copyInterDist(project);
  },
  async watch(project, mode) {
    await copyInterDist(project);
    const watcher = watch(project.interDistDir);
    watcher.on('change', () => {
      copyInterDist(project);
    });
  },
};
