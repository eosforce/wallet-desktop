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
    semi: ['error', 'always'],
    // 允许换行末尾逗号
    'comma-dangle': ['warn', 'only-multiline'],
    // 函数后不需要空格
    'space-before-function-paren': ['warn', 'never'],
    // 允许空的 reject
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
    // 驼峰
    camelcase: ['warn', { properties: 'never' }],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // console 警告
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
  },
};
