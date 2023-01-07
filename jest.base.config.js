module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/', '/build/', '/cdk.out/', '.d.ts'],
  passWithNoTests: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
