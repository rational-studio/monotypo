import { isMainThread, parentPort, workerData } from 'worker_threads';
import { BuildMode } from '../../utils/typings';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';
import { dev, prod } from './configs';
import * as util from 'util';

const INCREMENTAL_CACHE_FILE = 'tsbuild.json';

if (isMainThread) {
  throw new Error(
    'TypeScript compiler is not supposed to run on the main thread.'
  );
} else {
  const { projectSourceDir, projectTempFolder, mode, outDir } = workerData as {
    projectSourceDir: string;
    projectTempFolder: string;
    mode: BuildMode;
    outDir: string;
  };

  glob(path.join(projectSourceDir, '**', '*.{ts,tsx}'), (err, files) => {
    const tsConfig = mode === 'development' ? dev : prod;

    const compilerHost = ts.createCompilerHost({
      ...tsConfig,
      noEmitOnError: true,
      sourceRoot: projectSourceDir,
    });

    const originalGetSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = (fileName, ...args) => {
      // console.log(fileName);
      return originalGetSourceFile.call(compilerHost, fileName, ...args);
    };

    const program = ts.createProgram({
      rootNames: files,
      options: {
        ...tsConfig,
        noEmitOnError: true,
        outDir,
        tsBuildInfoFile: path.join(projectTempFolder, INCREMENTAL_CACHE_FILE),
      },
      host: compilerHost,
    });

    const result = program.emit();

    if (!result.emitSkipped) {
      parentPort?.postMessage('success');
    } else {
      console.log(util.inspect(result.diagnostics));
      parentPort?.postMessage('failed');
    }
  });
}
