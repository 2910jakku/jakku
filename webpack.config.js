const webpack = require("webpack");
const path = require("path");

var jF = path.resolve(__dirname,"scripts");
var bF = path.resolve(__dirname,"build");

var config = {
    entry:{
        "order":jF +"/order.js",
        "kitchen":jF+"/kitchen.js",
        "management":jF+"/management.js",
        "order_board":jF+"/order_board.js",
        "kitchen_login":jF+"/kitchen_login.js"
    },
    output:{
        filename:"[name]bundle.js",
        path:bF
    },
    plugins:[
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery"
        })
    ]
}

module.exports = config;