import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const DUCKDB_DIST = path.dirname(require.resolve('@duckdb/duckdb-wasm'));
const OUTPUT_DIR = './wasm';

function printErr(err) {
    if (err) return console.log(err);
}

fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-mvp.wasm'), path.resolve(OUTPUT_DIR, './duckdb-mvp.wasm'), printErr);
fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-eh.wasm'), path.resolve(OUTPUT_DIR, './duckdb-eh.wasm'), printErr);
fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-coi.wasm'), path.resolve(OUTPUT_DIR, './duckdb-coi.wasm'), printErr);
fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-browser-mvp.worker.js'), path.resolve(OUTPUT_DIR, './duckdb-browser-mvp.worker.js'), printErr);
// fs.copyFile(
//     path.resolve(DUCKDB_DIST, 'duckdb-browser-mvp.worker.js.map'),
//     path.resolve(OUTPUT_DIR, './duckdb-browser-mvp.worker.js.map',
//     printErr,
// );
fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-browser-eh.worker.js'), path.resolve(OUTPUT_DIR, './duckdb-browser-eh.worker.js'), printErr);
fs.copyFile(
    path.resolve(DUCKDB_DIST, 'duckdb-browser-eh.worker.js.map'),
    path.resolve(OUTPUT_DIR, './duckdb-browser-eh.worker.js.map'),
    printErr,
);
fs.copyFile(path.resolve(DUCKDB_DIST, 'duckdb-browser-coi.worker.js'), path.resolve(OUTPUT_DIR, './duckdb-browser-coi.worker.js'), printErr);
fs.copyFile(
    path.resolve(DUCKDB_DIST, 'duckdb-browser-coi.worker.js.map'),
    path.resolve(OUTPUT_DIR, './duckdb-browser-coi.worker.js.map'),
    printErr,
);
fs.copyFile(
    path.resolve(DUCKDB_DIST, 'duckdb-browser-coi.pthread.worker.js'),
    path.resolve(OUTPUT_DIR, './duckdb-browser-coi.pthread.worker.js'),
    printErr,
);
fs.copyFile(
    path.resolve(DUCKDB_DIST, 'duckdb-browser-coi.pthread.worker.js.map'),
    path.resolve(OUTPUT_DIR, './duckdb-browser-coi.pthread.worker.js.map'),
    printErr,
);

esbuild.build({
    entryPoints: ['./src/index.ts'],
    outfile: './src/index.js',
    platform: 'browser',
    format: 'iife',
    target: 'esnext',
    bundle: true,
    minify: false,
    sourcemap: false,
});
