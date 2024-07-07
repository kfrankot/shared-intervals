import { babel } from '@rollup/plugin-babel'
import includePaths from 'rollup-plugin-includepaths'
import license from 'rollup-plugin-license'
// TODO: Need to look into what the typescript rollup plugin does...
// import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'

const license = `
@preserve
Kevin Frankot - shared-interval v<%= pkg.version %>
`

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist',
      format: 'es',
    },
    plugins: [
      // typescript(),
      license({
        banner: license
      }),
      includePaths({
        paths: ['src'],
        extensions: ['.ts', '.js'],
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.ts', '.js'],
      }),
      terser(),
    ],
  }
]
