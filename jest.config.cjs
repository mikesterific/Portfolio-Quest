module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest-setup.js"],
  moduleFileExtensions: ["ts", "js", "json", "vue"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.app.json" }],
    "^.+\\.vue$": "<rootDir>/tests/jest/vue3-sfc-transformer.cjs",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!three)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@$": "<rootDir>/src",
    "^phaser$": "<rootDir>/tests/__mocks__/phaser.ts",
    "^three$": "<rootDir>/tests/__mocks__/three.ts",
    "^three/examples/jsm/controls/PointerLockControls$":
      "<rootDir>/tests/__mocks__/three/examples/jsm/controls/PointerLockControls.ts",
  },
  collectCoverageFrom: ["src/**/*.{ts,js,vue}", "!src/main.ts", "!src/**/index.ts"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    "./src/game/scenes/SkillSpaceScene.ts": {
      branches: 77,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
