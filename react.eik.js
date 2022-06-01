import * as eik from '@eik/esbuild-plugin';
import esbuild from 'esbuild';

await eik.load();

await esbuild.build({
  plugins: [eik.plugin()],
  entryPoints: ['react/index.js'],
  bundle: true,
  outfile: 'dist/react/icons.min.js',
  format: 'esm',
  sourcemap: true,
  target: 'es2017',
  minify: true,
  external: ['react'],
});
