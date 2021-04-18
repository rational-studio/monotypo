import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as process from 'process';
import {
  findMonorepoRoot,
  findRootPackageJson,
  getWorkspaceInfo,
  resolveWorkspaces,
} from './yarn/getWorkspaceInfo';
import { MPackage } from './MPackage';
import * as assert from 'assert';
import { MinimalPackageJSON } from './typings';

let packageInfoConstructed = false;

const memoizedMPackageInfo: Map<string, MPackage> = new Map();

export function findCurrentPackageJsonPath(
  directory: string = process.cwd()
): string {
  if (directory === '/') {
    throw new Error('Unable to find current package.json file.');
  }
  const packageJSONPath = path.join(directory, 'package.json');
  try {
    fs.accessSync(packageJSONPath, fs.constants.F_OK);
    const packageJSON = __non_webpack_require__(packageJSONPath);
    if (!packageJSON.workspaces) {
      return packageJSONPath;
    } else {
      throw new Error('Unable to find current package.json file.');
    }
  } catch (err) {
    // package.json doesn't exist here
    return findCurrentPackageJsonPath(path.dirname(directory));
  }
}

export function findCurrentPackageDependencies(
  directory: string = process.cwd()
): {
  name: string;
  packageJsonPath: string;
  projectFolder: string;
  dependencies: string[];
} {
  const packageJsonPath = findCurrentPackageJsonPath(directory);
  const packageJson: MinimalPackageJSON = __non_webpack_require__(
    packageJsonPath
  );
  const allDependencies = getWorkspaceInfo();
  const info = allDependencies[packageJson.name];
  return {
    name: packageJson.name,
    packageJsonPath,
    projectFolder: path.dirname(packageJsonPath),
    dependencies: [
      ...info.workspaceDependencies,
      ...info.mismatchedWorkspaceDependencies,
    ],
  };
}

export function getWorkspacesSync(
  baseDirectory: string = process.cwd()
): readonly string[] {
  // used only in `.jest.config.js` where it's not possible to be async
  const rootPackageJSON = findRootPackageJson(baseDirectory);
  let packageJSONLocations: string[] = [];
  resolveWorkspaces(rootPackageJSON).forEach(workspace => {
    packageJSONLocations = packageJSONLocations.concat(
      glob.sync(`${path.join(findMonorepoRoot(), workspace)}/package.json`, {
        absolute: true,
        ignore: '**/node_modules/**',
      })
    );
  });
  return packageJSONLocations;
}

export function getPackageInfo() {
  if (!packageInfoConstructed) {
    const workspaceInfo = getWorkspaceInfo();

    Object.entries(workspaceInfo).forEach(([repoName, repoInfo]) => {
      // Initial MPackageInfo
      const mPackageInfo = new MPackage(repoName, repoInfo.location);
      memoizedMPackageInfo.set(repoName, mPackageInfo);
    });

    // Run through again to set up monorepoDependencies
    Object.entries(workspaceInfo).forEach(([repoName, repoInfo]) => {
      const currentPackage = memoizedMPackageInfo.get(repoName);
      assert(currentPackage, `Unable to find "${repoName}" in packageInfo`);
      const dependencies = [
        ...repoInfo.workspaceDependencies,
        ...repoInfo.mismatchedWorkspaceDependencies,
      ];
      currentPackage.dependencies = dependencies.map(item => {
        const pinfo = memoizedMPackageInfo.get(item);
        assert(pinfo, `Unable to find "${item}" in packageInfo`);
        return pinfo;
      });
    });

    packageInfoConstructed = true;
  }

  return memoizedMPackageInfo;
}
