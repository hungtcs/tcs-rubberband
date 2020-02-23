const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: (module, chunks, cacheGroupKey) => {
            const moduleFileName = module.identifier().split('/').reduceRight(item => item);
            // const allChunksNames = chunks.map((item) => item.name).join('~');
            return `${ cacheGroupKey }-${ moduleFileName }`;
          },
          chunks: 'all'
        },
      },
    },
  },
  performance: {
    hints: false,
  },
});
