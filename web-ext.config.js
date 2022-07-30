module.exports = {
  build: {
    overwriteDest: true,
  },
  ignoreFiles: [
    'package-lock.json',
    'yarn.lock',
    'src',
    '.eslintrc.cjs',
    '.prettierrc',
    'tsconfig.json',
    'web-ext.config.js'
  ],
};