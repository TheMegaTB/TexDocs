const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === "production";

console.log("Running in " + (!PRODUCTION ? "development" : "production") + " mode!");

let copyConfig = [
    {from: 'node_modules/pdfjs-dist/build/pdf.worker.js', to: 'pdf.worker.js'}
];

if (PRODUCTION) {
    copyConfig = [
        {from: './app/index.html', to: 'index.html'},
        {from: './app/main.css', to: 'main.css'},
        ...copyConfig
    ];
}

const config = {
    entry: [
        path.resolve(__dirname, 'app/main.jsx')
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/',
        filename: './bundle.js'
    },
    module: {
        loaders: [
            {test: /\.json$/, loader: "json-loader"},
            {test: /\.css$/, include: path.resolve(__dirname, 'app'), loader: 'style-loader!css-loader'},
            {
                test: /\.js[x]?$/,
                include: path.resolve(__dirname, 'app'),
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new ProgressBarPlugin(),
        new CopyWebpackPlugin(copyConfig)
    ]
};

if (!PRODUCTION) {
    config.entry = [
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080',
        ...config.entry
    ];
    config.devServer = {
        historyApiFallback: {
            index: '/'
        },
        hot: true,
        inline: true,
        progress: true,
        contentBase: './app',
        port: 8080
    };
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
    config.plugins = [
        new webpack.optimize.DedupePlugin(),
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        ...config.plugins
    ];
}
module.exports = config;
