const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: process.NODE_ENV || "development",
  node:{
    __dirname: false
  },
  entry: "./src",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf)$/i,
        use: [{ loader: "file-loader" }]
      },
      {
        test: /\.node/i,
        use: [
          { loader: "native-ext-loader" }
         
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};