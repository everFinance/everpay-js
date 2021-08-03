module.exports = {
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  testEnvironment: 'node',
  testTimeout: 300000,
  testRegex: '/test/.*\\.test\\.ts$',
  // testRegex: '/test/withdraw.quick\\.test\\.ts$',
  transformIgnorePatterns: ['./node_modules/(?!lodash-es)']
}
