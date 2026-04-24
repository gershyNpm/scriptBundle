import Logger from '@gershy/logger';
import { rootFact, tempFact } from '@gershy/disk';
import { assertEqual, testRunner } from '../build/utils.test.ts';
import scriptBundle, { runCjsBundleInEsm } from './main.ts';

// Type testing
(async () => {
  
  type Enforce<Provided, Expected extends Provided> = { provided: Provided, expected: Expected };
  
  type Tests = {
    1: Enforce<{ x: 'y' }, { x: 'y' }>,
  };
  
})();

testRunner([
  
  { name: 'basic test', fn: async () => {
    
    const bundle = await scriptBundle({
      logger:    Logger.dummy,
      term:      'myCoolFunc',
      platform:  'node/cjs',
      debug: true,
      dirFact: rootFact.kid([ import.meta.dirname ]),
      script: String[cl.baseline](`
        | import '@gershy/clearing';
        | import { testFn } from './util.test.ts';
        | module.exports.result = ('Y' + testFn({ a: 5, b: 'O' }))[cl.lower]();
      `)
    });
    
    assertEqual(
      await runCjsBundleInEsm(bundle),
      { result: 'yooooo' }
    );
    
  }}
  
]);