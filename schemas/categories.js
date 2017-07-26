var mongoose = require('mongoose');

// 博客分类的表结构
module.exports = new mongoose.Schema({
    // 分类名称
    name: String,

});