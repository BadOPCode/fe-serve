const path = require("path");

module.exports = {
    mode: 'development',
    entry: './src/client/FullstackClient.ts',
    output: {
        path: path.join(__dirname, 'lib', 'client'),
        filename: 'FullstackClient.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            options: {
                configFile: "tsconfig.client.json"
            }
        }]
    }
}