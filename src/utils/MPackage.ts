import { GraphNode } from './parallelism';
import * as path from 'path';
import * as fs from 'fs-extra';
import { findMonorepoRoot } from './yarn/getWorkspaceInfo';
import { getPackageDeps } from '@rushstack/package-deps-hash';
import { pluginManager } from './pluginManager';
import { isValidMConfig } from '../schema/mConfig';
import { InferType } from 'typanion';
import { CompilationDiagnostic } from './typings';
import { buildInterDist } from './interDist';

const M_CACHE_FOLDER = '.m';

/* 
  Since this tool combines monorepo management AND TypeScript support. By default, everything would be assumed as TypeScript files.
  Therefore TypeScript compilation is the mandatory first step, this folder stores the intermediate distribution (InterDist) files.

  This compilation can be done either in `swc` or `tsc`.

  The strategies for other targets:
  
  - library -> simply copy InterDist to actual dist folder
  - web -> by default, it just bundles InterDist with Webpack, no Babel or TypeScript preprocessing nor SCSS/Preprocessing
*/
const M_CACHE_TYPESCRIPT_INTER_DIST = '.typeInterDist';

const DEP_HASH_FILE = 'dep-hash.json';
const M_CONFIG_FILE = 'm.config.json';

const SOURCE_DIR = 'src';
const DIST_DIR = 'lib';

const workspaceRoot = findMonorepoRoot();

type ValidMConfig = InferType<typeof isValidMConfig>;

interface GlobalSettings {
  watch: {
    port: number;
    https: boolean;
  };
}

export class MPackage implements GraphNode {
  private _name: string;
  private _packageFolder: string;
  private _interDistFolder: string;
  private _packageJsonLocation: string;
  private _mTempFolder: string;
  private _depHashLocation: string;
  private _mConfigLocation: string;
  private _monorepoDependencies: MPackage[] = [];
  private _cachedValidMConfig?: ValidMConfig;
  private _errorMessages: CompilationDiagnostic[] = [];
  private _warningMessages: CompilationDiagnostic[] = [];

  constructor(packageName: string, packageFolder: string) {
    this._name = packageName;
    this._packageFolder = path.resolve(workspaceRoot, packageFolder);
    this._packageJsonLocation = path.resolve(
      workspaceRoot,
      packageFolder,
      'package.json'
    );
    this._mTempFolder = path.resolve(
      workspaceRoot,
      packageFolder,
      M_CACHE_FOLDER
    );
    this._interDistFolder = path.join(
      this._mTempFolder,
      M_CACHE_TYPESCRIPT_INTER_DIST
    );
    this._depHashLocation = path.resolve(this._mTempFolder, DEP_HASH_FILE);
    this._mConfigLocation = path.resolve(
      workspaceRoot,
      packageFolder,
      M_CONFIG_FILE
    );
  }
  public get name() {
    return this._name;
  }
  public get dependencies() {
    return this._monorepoDependencies;
  }
  public set dependencies(value: MPackage[]) {
    this._monorepoDependencies = value;
  }
  public get mConfigLocation() {
    return this._mConfigLocation;
  }
  public get sourceDir() {
    return path.join(this._packageFolder, SOURCE_DIR);
  }
  public get distributionDir() {
    return path.join(this._packageFolder, DIST_DIR);
  }
  /**
   * @description
   * Since this tool combines monorepo management AND TypeScript support. By default, everything would be assumed as TypeScript files.
   * Therefore TypeScript compilation is the mandatory first step, this folder stores the intermediate distribution (InterDist) files.
   */
  public get interDistDir() {
    return this._interDistFolder;
  }
  public get isMConfigExisted() {
    try {
      fs.accessSync(this._mConfigLocation, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  public get isMConfigValid() {
    try {
      const mConfigData = JSON.parse(
        fs.readFileSync(this._mConfigLocation, {
          encoding: 'utf-8',
        })
      );
      const errors: string[] = [];
      if (isValidMConfig(mConfigData, { errors })) {
        this._cachedValidMConfig = mConfigData;
        return true;
      } else {
        // TODO: Print out errors
        return false;
      }
    } catch {
      return false;
    }
  }
  private getDepHash() {
    const depHash = getPackageDeps(this._packageFolder);
    const depHashArray = Array.from(depHash.entries());
    return JSON.stringify(depHashArray);
  }
  public get diagnosticErrors() {
    return this._errorMessages;
  }
  public get diagnosticWarnings() {
    return this._warningMessages;
  }
  public get isDepHashUnchanged() {
    try {
      const currentDepHash = this.getDepHash();
      const previousDepHash = fs.readFileSync(this._depHashLocation, {
        encoding: 'utf-8',
      });
      return currentDepHash === previousDepHash;
    } catch {
      return false;
    }
  }
  public get projectTempFolder() {
    return this._mTempFolder;
  }
  public async updateDepHash() {
    await fs.ensureFile(this._depHashLocation);
    await fs.writeFile(this._depHashLocation, this.getDepHash());
  }

  public async clean() {
    await Promise.all([
      fs.remove(this._mTempFolder),
      fs.remove(this.distributionDir),
    ]);
  }

  public async build() {
    if (!this._cachedValidMConfig) {
      console.assert(this.isMConfigValid);
    }
    /**
     * The build steps:
     * BuildInterDist -> Resolve Targets -> Call `Build` on Targets
     */
    await buildInterDist(this, 'development');

    const buildTarget = pluginManager.resolveTarget(
      this._cachedValidMConfig!.target
    );

    await buildTarget.build(this, 'development');
  }
}
