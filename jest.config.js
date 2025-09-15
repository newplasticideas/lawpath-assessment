/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(ts|tsx|js)$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!jose)/"],
};
