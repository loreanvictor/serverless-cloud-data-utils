import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

import base from './base';


export default Object.assign(base, {
  plugins: [
    terser(),
    nodeResolve(),
  ],
  output: [
    Object.assign(base.output, {
      file: 'dist/bundles/streamlet.es6.min.js',
    }),
    {
      file: 'dist/bundles/streamlet.es.min.js',
      format: 'es'
    }
  ]
});
