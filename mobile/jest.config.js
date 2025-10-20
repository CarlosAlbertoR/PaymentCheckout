module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/android/",
    "<rootDir>/ios/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|@reduxjs|react-native-paper|react-native-vector-icons|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|@expo|expo)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};
