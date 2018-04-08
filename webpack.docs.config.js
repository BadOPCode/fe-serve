const path = require("path");

module.exports = {
    mode: 'production',
    entry: './docs-src/bootstrap.tsx',
    output: {
        path: path.join(__dirname, 'docs'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: "tsconfig.docs.json"
                }
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                },

                react: {
                    name: "react",
                    test: /[\\/]node_modules[\\/]react.*/,
                    chunks: "initial",
                }
            }
        }
    }
}