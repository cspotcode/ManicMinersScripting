import * as path from 'path';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
  mode: 'development',
  optimization: {
    minimize: false,
  },
  entry: './browser.tsx',
  output: {
    // path: path.resolve(__dirname, 'dist'),
    path: path.resolve(__dirname),
    filename: 'browser.js'
  },
  // devServer: {
  //   contentBase: './',
  // },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};

export default config;