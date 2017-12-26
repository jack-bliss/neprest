const path = require('path');

module.exports = {
    entry: {
        server: './neprest/index.ts'
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    target: 'node',
    externals: [/(node_modules|main\..*\.js)/],
    output: {
        path: path.join(__dirname, 'bundle'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    },
};
