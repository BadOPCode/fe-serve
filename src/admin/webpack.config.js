const path = require("path");

module.exports = {
    mode: 'production',
    devtool: "inline-source-map",
    entry: './js/FullstackAdmin.ts',
    output: {
        path: path.join(__dirname, '..', '..', 'lib', 'admin', 'js'),
        filename: 'fs-admin.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: "tsconfig.admin.json",
                }
            },
            // { loader: "style-loader" },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
}