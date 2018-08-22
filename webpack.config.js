const path = require("path");

module.exports = {
    mode: 'development',
    entry: './src/client/FullstackClient.ts',
    output: {
        path: path.join(__dirname, 'lib', 'client'),
        filename: 'FullstackClient.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: "tsconfig.client.json"
                }
            },
            { loader: "style-loader" },
            {
                test: /\.css$/,
                loader: 'css-loader',
            }
        ]
    },
}