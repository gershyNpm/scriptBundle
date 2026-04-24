import '@gershy/clearing';
import { Fact } from '@gershy/disk';
import Logger from '@gershy/logger';
import { createRequire } from 'node:module';
import esbuild from 'esbuild';

type ScriptBundleArgs = {
  
  logger:              Logger,
  term:                string,
  platform:            'node/esm' | 'node/cjs' | 'web',
  debug:               boolean,
  
  dirFact:             Fact, // The directory which virtually should be considered to contain the script for purposes of module resolution
  script:              string,
  
  hash?:               string,
  externalImportUrls?: string[]
  
};

// TODO: HEEERE test!
export default async (args: ScriptBundleArgs) => {
  
  const { logger, term, platform, debug, dirFact, script, externalImportUrls: externalImportPaths } = args;
  
  return logger.scope('scriptBundle', { term }, async logger => {
    
    const result = await esbuild.build({
      stdin: {
        contents: script,
        loader:   'ts',
        resolveDir: dirFact.fsp()
      },
      // entryPoints: [ tmpScriptFact.fsp() ],
      define: {
        'import.meta.url':      `__filename`, // TODO: ideally should use `new URL(__filename).href` but esbuild needs a reference or serial type...
        'import.meta.dirname':  `__dirname`,
        'import.meta.filename': `__filename`,
      },
      bundle:      true,
      platform:    ({ 'node/esm': 'node', 'node/cjs': 'node', web: 'browser' } as const)[platform],
      format:      ({ 'node/esm': 'esm',  'node/cjs': 'cjs',  web: 'iife'    } as const)[platform],
      minify:      !debug,
      write:       false,
      sourcemap:   debug ? 'inline' : false,
      external:    externalImportPaths ?? []
    });
    return Buffer.from(result.outputFiles[0].contents).toString('utf8');
    
  });
  
};

export const runCjsBundleInEsm = async (bundle: string) => {
  
  const __filename = import.meta.filename;
  const __dirname = import.meta.dirname;
  const require = createRequire(import.meta.url);
  const exports = {};
  const module = { exports };
  
  if (![ __filename, __dirname, require, exports, module ].map(v => cl.getClsName(v)).join(','))
    return null as never;
  
  await eval(bundle);
  
  return module.exports as unknown;
  
};