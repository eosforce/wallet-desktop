module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: 'standard',
  globals: {
    __static: true,
  },
  plugins: ['html'],
  rules: {
    // 语句后面必须加上分号
    'semi': ['warn', 'always'],

    'eqeqeq': ['warn'],
    // 允许换行末尾逗号
    'comma-dangle': ['warn', 'only-multiline'],
    // 函数后不需要空格
    'space-before-function-paren': ['warn'],
    // 允许空的 reject
    'prefer-promise-reject-errors': ['warn', { allowEmptyReject: true }],
    // 驼峰
    'camelcase': ['warn', { properties: 'never' }],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'no-unneeded-ternary': ['warn'],
    'space-before-blocks': ['warn'],
    // allow async-await
    'generator-star-spacing': 0,
    'no-trailing-spaces': ["warn", { "skipBlankLines": true }],
    // console 警告
    'no-console': ['warn', { allow: ['warn'] }],
    'keyword-spacing': ['warn', { "overrides": { "if": { "after": true, "before": true}, "for": { "after": true, "before": true}, "while": { "after": true, "before": true} } }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-multi-spaces': ['warn']
  },
};
