export default {
  setupFiles: ["./tests/jest.setup.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest" // Verwende Babel, um .js-Dateien zu transformieren
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage"
}
