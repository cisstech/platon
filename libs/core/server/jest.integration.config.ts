export default {
  displayName: 'core-server-integration',
  preset: '../../../jest.preset.js',
  testMatch: ['**/*.integration.spec.ts'],
  testTimeout: 60_000,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.integration.json' }],
    '^.+\\.js$': [
      '@swc/jest',
      {
        jsc: { target: 'es2022', parser: { syntax: 'ecmascript' } },
        module: { type: 'commonjs' },
      },
    ],
  },
  coverageDirectory: '../../../coverage/libs/core/server/integration',
}
