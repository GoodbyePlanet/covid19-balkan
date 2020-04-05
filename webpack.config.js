const $path = require("path");

// const isProd = process.env.NODE_ENV === "production";
// const outputFilename = isProd ? "[name].[contenthash].js" : "name.[hash].js";

module.exports = {
  mode: "production",

  devtool: "source-map",

  entry: {
    index: "./src/index.js",
  },

  output: {
    path: $path.join(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "/dist/",
  },

  devServer: {
    compress: true,
    port: 3011,
    hot: true,
    stats: "errors-only",
    open: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: ["@babel/plugin-syntax-dynamic-import"],
          },
        },
      },
      {
        test: /.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
    ],
  },
};
