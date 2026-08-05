import { rootFact } from '@gershy/disk';
import { assertEqual, testRunner } from '../build/utils.test.ts';
import scriptBundle from './main.ts';
import evalCjs from './util/evalCjs.ts';

// Type testing
(async () => {
  
  type Enforce<Provided, Expected extends Provided> = { provided: Provided, expected: Expected };
  
  type Tests = {
    1: Enforce<{ x: 'y' }, { x: 'y' }>,
  };
  if (0) ((v?: Tests) => void 0)();
  
})();

testRunner([
  
  { name: 'basic test', fn: async () => {
    
    const bundle = await scriptBundle({
      platform:  'node/cjs',
      debug: true,
      dirFact: rootFact.kid([ import.meta.dirname ]),
      script: String[cl.baseline](`
        | import '@gershy/clearing';
        | import { testFn } from './import.test.ts';
        | export default 123;
        | export const result = ('Y' + testFn({ a: 5, b: 'O' }))[cl.lower]();
        | export const another = 'hello';
      `)
    });
    
    assertEqual(
      await evalCjs({ meta: import.meta, bundle }),
      { default: 123, result: 'yooooo', another: 'hello' }
    );
    
  }}
  
]);