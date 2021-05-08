import { presetBundlers } from '../bundlers';
import { Bundler } from '../bundlers/typings';
import { presetExtensions } from '../extensions';
import { Extension } from '../extensions/typings';
import { Compiler } from './typings';

class PluginManager {
  private bundlers: Map<string, Bundler> = new Map();
  private extensions: Map<string, Extension> = new Map();
  public registerBundler(bundler: Bundler) {
    this.bundlers.set(bundler.name, bundler);
  }
  public registerExtension(extension: Extension) {
    this.extensions.set(extension.name, extension);
  }
  public resolveBundler(name: string) {
    const target = this.bundlers.get(name);
    if (target) {
      return target;
    } else {
      throw new Error(`Target "${name}" cannot be found.`);
    }
  }
  public resolveExtension(name: string, compiler: Compiler) {
    const extension = this.extensions.get(name);
    if (extension) {
      if (extension.compilerSupported.includes(compiler)) {
        return extension;
      } else {
        throw new Error(
          `Extension "${name}" does not support compiler "${compiler}".`
        );
      }
    } else {
      throw new Error(`Extension "${name}" cannot be found.`);
    }
  }
  public getExtensionsByCompiler(compiler: Compiler): unknown[] {
    return Array.from(this.extensions.values()).filter(item =>
      item.compilerSupported.includes(compiler)
    );
  }
}

export const pluginManager = new PluginManager();

// Register preset targets
presetBundlers.forEach(bundler => pluginManager.registerBundler(bundler));

// TODO: create a way to scan customised targets

// Register preset extensions (sass, treat.js, etc.)
presetExtensions.forEach(plugin => pluginManager.registerExtension(plugin));

// TODO: create a way to scan customised extensions
