const webpack = require("webpack");
const $path = require("path");

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  mode: "production",

  devtool: "source-map",

  entry: ["./src/index.js", "./src/styles/main.css"],

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
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader?cacheDirectory",
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
      {
        test: /\.(jpe?g|png|gif|ico|svg)$/i,
        loader: "file?name=[name].[ext]",
      },
    ],
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      // this is the url of our local sourcemap server
      publicPath: "http://localhost:3011/",
      filename: "[file].map",
    }),
  ],
};
