const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const polyfillNode = require('rollup-plugin-polyfill-node');

module.exports = {
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
        polyfillNode({
            include: ['crypto'],
        }),
    ],
};