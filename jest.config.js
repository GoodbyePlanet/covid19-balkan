module.exports = {
  verbose: true,
  rootDir: './',
  transform: {
    "^.+\\.(js)$": "babel-jest-amcharts"
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\](?!(@amcharts)\\/).+\\.(js|jsx|ts|tsx)$',
  ],
};