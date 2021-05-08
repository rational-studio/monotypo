import { isMainThread, parentPort, workerData } from 'worker_threads';
import { BuildMode } from '../../utils/typings';
import * as glob from 'glob';
import * as path from 'path';
import * as ts from 'typescript';
import { getDevConfig, getProdConfig } from './configs';
import * as util from 'util';
import { ValidMConfig } from '../../utils/MPackage';
import reactRefresh from 'react-refresh-typescript';

const INCREMENTAL_CACHE_FILE = 'tsbuild.json';

if (isMainThread) {
  throw new Error(
    'TypeScript compiler is not supposed to run on the main thread.'
  );
} else {
  const {
    projectSourceDir,
    projectTempFolder,
    mode,
    outDir,
    config,
  } = workerData as {
    projectSourceDir: string;
    projectTempFolder: string;
    mode: BuildMode;
    outDir: string;
    config: ValidMConfig;
  };

  const isDevMode = mode === 'development';
  const applyFastRefresh = isDevMode && config.jsx !== 'none';

  console.log({ applyFastRefresh });

  glob(path.join(projectSourceDir, '**', '*.{ts,tsx}'), (err, allFiles) => {
    // Exclude all test files (should be an option)
    const files = allFiles.filter(
      fileName =>
        !fileName.endsWith('.test.ts') && !fileName.endsWith('.test.tsx')
    );
    const tsconfigFunction = isDevMode ? getDevConfig : getProdConfig;

    const compilerHost = ts.createIncrementalCompilerHost({
      ...tsconfigFunction(config),
      noEmitOnError: true,
      sourceRoot: projectSourceDir,
    });

    const program = ts.createProgram({
      rootNames: files,
      options: {
        ...tsconfigFunction(config),
        noEmitOnError: true,
        outDir,
        tsBuildInfoFile: isDevMode
          ? path.join(projectTempFolder, INCREMENTAL_CACHE_FILE)
          : undefined,
      },
      host: compilerHost,
    });

    const result = program.emit(
      undefined,
      undefined,
      undefined,
      undefined,
      applyFastRefresh
        ? {
            before: [reactRefresh()],
          }
        : undefined
    );

    if (!result.emitSkipped) {
      parentPort?.postMessage('success');
    } else {
      console.log(util.inspect(result.diagnostics));
      parentPort?.postMessage('failed');
    }
  });
}
