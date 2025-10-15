// export default {
//   testEnvironment: "node",
//   roots: ["<rootDir>/src", "<rootDir>/tests"],
//   testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
//   setupFiles: ["<rootDir>/tests/setupEnv.js"],
//   // Allow running ESM tests without Babel by using Node's experimental vm modules
//   transform: {},
//   coveragePathIgnorePatterns: [
//     "/node_modules/",
//     "<rootDir>/src/index.js",
//     "<rootDir>/src/config/db.js",
//     "<rootDir>/src/middlewares/upload.js",
//   ],
//   collectCoverage: true,
//   collectCoverageFrom: [
//     "src/**/*.js",
//   ],
//   coverageThreshold: {
//     global: {
//       branches: 80,
//       functions: 80,
//       lines: 80,
//       statements: 80,
//     },
//   },
// };
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "clover"],
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  testMatch: ["**/tests/**/*.test.js"]
};
