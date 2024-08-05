import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/LilDb.js',
  output: {
    file: 'dist/lil-db.js',
    format: 'umd',
    name: 'LilDb',
    globals: {
      fs: 'fs',
      uuid: 'uuid',
    },
  },
  plugins: [
    resolve(),
    commonjs(),
  ],
};