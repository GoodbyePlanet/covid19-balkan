const $path = require("path");

// const isProd = process.env.NODE_ENV === "production";
// const outputFilename = isProd ? "[name].[contenthash].js" : "name.[hash].js";

module.exports = {
  mode: "production",

  devtool: "source-map",

  // entry: {
  //   index: "./src/index.js",
  // },

  entry: ["./src/index.js", "./src/styles/main.css"],

  // output: {
  //   path: $path.join(__dirname, "dist"),
  //   filename: "[name].js",
  //   chunkFilename: "[name].js",
  //   publicPath: "/dist/",
  // },

  output: {
    path: $path.join(__dirname, "dist"),
    publicPath: "/",
    filename: "bundle.js",
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
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
};
