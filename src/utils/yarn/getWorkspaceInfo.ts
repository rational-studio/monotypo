import * as crossSpawn from 'cross-spawn';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as process from 'process';
import type { MinimalPackageJSON } from '../typings';

let memoizedRootJsonPath: string | null = null;

type YarnWorkspaceInfo = {
  [key: string]: {
    location: string;
    workspaceDependencies: string[];
    mismatchedWorkspaceDependencies: string[];
  };
};

let memoizedYarnWorkspaceInfo: YarnWorkspaceInfo | null = null;

export function getWorkspaceInfo() {
  if (memoizedYarnWorkspaceInfo) {
    return memoizedYarnWorkspaceInfo;
  }
  const result = crossSpawn.sync('yarn', [
    '-s',
    'workspaces',
    'info',
    '--json',
  ]);

  const sanitizeStdout = () => {
    const data = JSON.parse(result.stdout.toString());
    if (data.data === undefined) {
      // yarn updated how they return data from yarn workspaces info --json, this is to support 1.22.0
      memoizedYarnWorkspaceInfo = data as YarnWorkspaceInfo;
    } else {
      // This is how the data has to be parsed prior to 1.22.0
      memoizedYarnWorkspaceInfo = JSON.parse(data.data) as YarnWorkspaceInfo;
    }
    return memoizedYarnWorkspaceInfo;
  };

  return sanitizeStdout();
}

function findRootPackageJsonPath(directory: string = process.cwd()): string {
  if (memoizedRootJsonPath !== null) {
    return memoizedRootJsonPath;
  }

  if (directory === '/') {
    throw new Error('Unable to find root package.json file.');
  }

  const packageJSONPath = path.join(directory, 'package.json');

  try {
    fs.accessSync(packageJSONPath, fs.constants.F_OK);

    const packageJSON = __non_webpack_require__(packageJSONPath);
    if (!packageJSON.workspaces) {
      // not a root package.json
      return findRootPackageJsonPath(path.dirname(directory));
    }
    memoizedRootJsonPath = packageJSONPath;
    return packageJSONPath;
  } catch (err) {
    // package.json doesn't exist here
    return findRootPackageJsonPath(path.dirname(directory));
  }
}

export function findMonorepoRoot(directory: string = process.cwd()): string {
  return path.dirname(findRootPackageJsonPath(directory));
}

export function findRootPackageJson(
  directory: string = process.cwd()
): MinimalPackageJSON {
  const packageJsonPath = findRootPackageJsonPath(directory);

  return __non_webpack_require__(packageJsonPath);
}

export function resolveWorkspaces(
  packageJSON: MinimalPackageJSON
): readonly string[] {
  const workspaces = packageJSON.workspaces;
  if (Array.isArray(workspaces)) {
    return workspaces;
  } else if (workspaces && Array.isArray(workspaces.packages)) {
    return workspaces.packages;
  }
  throw new Error('Cannot find workspaces definition.');
}
