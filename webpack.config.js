const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
        path: path.resolve(__dirname, "docs"),
        filename: "car.bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.png$/,
                loader: ["url-loader?mimetype=image/png"],
            },
        ],
    },
    resolve: {
        alias: {
            Styles: path.resolve(__dirname, "public/css/"),
            Images: path.resolve(__dirname, "public/img/"),
        },
    },
    plugins: [
        new htmlWebpackPlugin({
            template: path.resolve(__dirname, "public/index.html"),
            hash: true,
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    node: { child_process: "empty" },
};
