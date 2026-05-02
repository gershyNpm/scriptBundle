import '@gershy/clearing';
import esbuild from 'esbuild';
import type { Fact } from '@gershy/disk';

// TODO: HEEERE2! Can't build this package due to CJS + `import.meta` annoyances...
// - Switch from `tsc` to `esbuild` to build npm packages!
// - Finally run .manager's `{ act: 'setCommit', unit: 'scriptBundle' }`
// - Go back to lambda, which can now bundle its shizzzzz

type ScriptBundleArgs = {
  
  platform:            'node/esm' | 'node/cjs' | 'web',
  debug:               boolean,
  
  dirFact:             Fact, // The directory which virtually should be considered to contain the script for purposes of module resolution
  script:              string,
  
  hash?:               string,
  externalImportUrls?: string[]
  
};

export default async (args: ScriptBundleArgs) => {
  
  const err = Error('');
  const { platform, debug, dirFact, script, externalImportUrls: externalImportPaths } = args;
  
  const replaceTrg = (term: string) => `__esbuild_replace_target_${term.replace(/[^a-zA-Z0-9_$]/g, '_')}`;
  const result = await esbuild.build({
    stdin: {
      contents: script,
      loader:   'ts',
      resolveDir: dirFact.fsp()
    },
    // entryPoints: [ tmpScriptFact.fsp() ],
    define:      { 'import.meta': replaceTrg('import.meta'), },
    logLevel:    'silent',
    bundle:      true,
    platform:    ({ 'node/esm': 'node', 'node/cjs': 'node', web: 'browser' } as const)[platform],
    format:      ({ 'node/esm': 'esm',  'node/cjs': 'cjs',  web: 'iife'    } as const)[platform],
    minify:      !debug,
    write:       false,
    sourcemap:   debug ? 'inline' : false,
    external:    externalImportPaths ?? []
  }).catch(cause => err[cl.fire]({ msg: cause.message, ...cause[cl.slice]([ 'errors', 'warnings' ])[cl.map](arr => arr.map(v => v[cl.slice]([ 'text', 'location' ]))) }));
  
  return Buffer.from(result.outputFiles[0].contents)
    .toString('utf8')
    .replaceAll(replaceTrg('import.meta'), '({ url: new URL(__filename).href, dirname: __dirname, filename: __filename })');
  
};