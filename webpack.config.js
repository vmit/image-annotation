module.exports = {
    entry: {
        'image-annotation-editor': './src/index.js'
    },
    output: {
        path: __dirname,
        filename: 'build/[name].bundle.js',
        libraryTarget: 'umd'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                query: {
                    interpolate: true
                }
            },
            {
                test: /\.svg$/,
                loader: 'raw-loader'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    }
};