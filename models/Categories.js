var mongoose = require('mongoose');

// 博客分类的表结构
var categoriessSchema = require('../schemas/categories');

module.exports = mongoose.model('Category', categoriessSchema);