//jest configuration
module.exports = {
  testEnvironment: 'node',
  testMatch: ['./src/(.)+(spec|test).[tj]s?(x)'], 
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageDirectory: './coverage',
  moduleFileExtensions: ['js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};