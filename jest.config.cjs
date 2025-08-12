module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json', 'vue'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.app.json' }],
    '^.+\\.vue$': '<rootDir>/tests/jest/vue3-sfc-transformer.cjs',
  },
  transformIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@$': '<rootDir>/src',
    '^phaser$': '<rootDir>/tests/__mocks__/phaser.ts',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js,vue}',
    '!src/main.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    './src/game/scenes/GameUIScene.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/game/scenes/SkillSpaceScene.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    }
  },
};
