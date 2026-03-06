import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/index.ts',
        '!src/**/*.d.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
    testTimeout: 30000,
    verbose: true,
    // Ignore node_modules and build
    transformIgnorePatterns: ['/node_modules/'],
    // Don't transform js files
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};

export default config;
