module.exports = {
	verbose: true,
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.[tj]sx?$": ["babel-jest"]
	},
	transformIgnorePatterns: ["/node_modules/(?!@babylonjs)/"],
  };