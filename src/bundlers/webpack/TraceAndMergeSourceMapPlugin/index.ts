import {
  Compiler,
  WebpackPluginInstance,
  sources as webpackSources,
} from 'webpack';
import * as remapping from '@ampproject/remapping';
import * as fs from 'fs';
import * as path from 'path';

const MAPPING_URL_PREFIX = '# sourceMappingURL=';
const WEBPACK_INTERNAL_MODULE_PREFIX = 'webpack/';

export class TraceAndMergeSourceMapPlugin implements WebpackPluginInstance {
  private inlineSourceMap = false;
  constructor() {
    this.inlineSourceMap = false;
  }
  public apply(compiler: Compiler) {
    compiler.hooks.emit.tapPromise(
      { name: 'TraceAndMergeSourceMapPlugin' },
      async compilation => {
        const sources = Object.entries(compilation.assets);
        for (const [fileName, source] of sources) {
          if (fileName.endsWith('.map')) {
            // @ts-expect-error
            const newSourceMap = remapping(source.source().toString(), file => {
              if (file.includes('node_modules')) {
                return null;
              }
              console.log(file);
              try {
                const content = fs.readFileSync(file, 'utf-8');
                const prefixIndex = content.lastIndexOf(MAPPING_URL_PREFIX);
                if (prefixIndex === -1) {
                  console.log(
                    'no source map found due to no source mapping url'
                  );
                  return null;
                } else {
                  const urlStart = prefixIndex + MAPPING_URL_PREFIX.length;
                  const url = content.slice(urlStart).trim();
                  console.log(`find source map ${url}`);
                  try {
                    return fs.readFileSync(
                      path.resolve(path.dirname(file), url),
                      'utf-8'
                    );
                  } catch {
                    console.log(
                      'no source map found due to unable to parse the content'
                    );
                    return null;
                  }
                }
              } catch {
                console.log('no source map found due to error');
                return null;
              }
            });
            compilation.updateAsset(
              fileName,
              new webpackSources.RawSource(
                JSON.stringify({
                  ...newSourceMap,
                  sources: newSourceMap.sources.map(
                    (item: string) => `file://${item}`
                  ),
                })
              )
            );
          }
        }
      }
    );
  }
}
