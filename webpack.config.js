const path = require('path');

//Creates an index.html file (fully new or using defined template)
const HTMLWebpackPlugin = require('html-webpack-plugin');

//Extracts CSS code from JS file and creates one CSS file per JS file
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

//Minimizes CSS code in production build
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

//Minimizes Javascript Code in production build
const TerserPlugin = require('terser-webpack-plugin');

//Deletes all files from dist folder before rebuild
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

//Copies static files to dist folder
const CopyPlugin = require('copy-webpack-plugin');

//Replaces variables in code with other values or expressions at compile time.
const { DefinePlugin } = require('webpack');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

const fileName = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

const cssLoaders = (extra) => {
  const loaders = [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['postcss-preset-env'],
        },
      },
    },
  ];

  if (extra) {
    loaders.push(extra);
  }

  return loaders;
};

const optimizationConfig = () => {
  const config = {};

  if (isProd) {
    config.minimize = true;
    config.minimizer = [new TerserPlugin(), new CssMinimizerPlugin()];
  }

  return config;
};

const createWebpackConfig = () => {
  const config = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: fileName('js'),
    },
    devServer: {
      port: 5000,
      hot: isDev,
      watchFiles: ['src/*.html'],
    },
    plugins: [
      new HTMLWebpackPlugin({
        template: './index.html',
        minify: {
          collapseWhitespace: isProd,
        },
      }),
      new MiniCssExtractPlugin({ filename: fileName('css') }),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [{ from: './assets', to: './assets' }],
      }),
      new DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ],
    optimization: optimizationConfig(),
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
        {
          test: /\.css$/i,
          use: cssLoaders(),
        },
        {
          test: /\.s[ac]ss$/i,
          use: cssLoaders('sass-loader'),
        },
        { test: /\.(png|jpg|svg|gif)$/i, type: 'asset/resource' },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  };

  if (isDev) {
    config.devtool = 'source-map';
  }

  return config;
};

module.exports = createWebpackConfig();
