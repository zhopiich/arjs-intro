import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  ignores: [
    'dist/**',
    'src/vendor/**',
  ],
  vue: true,
})
