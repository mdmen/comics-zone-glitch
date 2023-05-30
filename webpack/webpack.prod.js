const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { sourceFolder, distFolder } = require('./helpers');

const mode = 'production';

module.exports = {
  mode,
  entry: [`${sourceFolder}/index.ts`],
  output: {
    filename: 'js/[contenthash].js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    path: distFolder,
    publicPath: '/',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              png: { quality: 90 },
            },
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      require('./loaders/css')(mode),
      require('./loaders/typescript')(),
      ...require('./loaders/assets')(),
    ],
  },
  plugins: [
    require('./plugins/html')(),
    require('./plugins/preload')(),
    require('./plugins/copy')(),
    new MiniCssExtractPlugin({
      filename: 'css/[contenthash].css',
    }),
  ],
  resolve: require('./resolve')(),
};
