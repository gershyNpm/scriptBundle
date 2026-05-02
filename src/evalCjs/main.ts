import { createRequire } from 'node:module';

export default async <Module = unknown>({
  bundle,
  meta = import.meta,
}: {
  bundle: string,
  meta?: { url: string, filename: string, dirname: string }
}) => {
  
  const __filename = meta.filename;
  const __dirname = meta.dirname;
  const require = createRequire(meta.url);
  const exports = {};
  const module = { exports };
  
  // Prevent all vars from appearing as unused (and potentially being removed by bundlers)
  if (![ __filename, __dirname, require, exports, module ].some(v => !!v)) return null as never;
  
  await eval(bundle);
  
  return module.exports as Module;
  
};