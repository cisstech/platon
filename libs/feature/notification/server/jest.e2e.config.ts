export default {
  displayName: 'feature-notification-server-e2e',
  preset: '../../../../jest.preset.js',
  testMatch: ['**/*.e2e.spec.ts'],
  testTimeout: 60_000,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.e2e.json' }],
    '^.+\\.js$': [
      '@swc/jest',
      {
        jsc: { target: 'es2022', parser: { syntax: 'ecmascript' } },
        module: { type: 'commonjs' },
      },
    ],
  },
  coverageDirectory: '../../../../coverage/libs/feature/notification/server/e2e',
}
