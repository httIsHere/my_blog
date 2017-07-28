// schemas文件夹下的content.js

var mongoose = require('mongoose');
var BSON = require('bson').BSONPure
module.exports = new mongoose.Schema({
    // 关联字段 -分类的id
    category: {
        // 类型
        type: mongoose.Schema.Types.ObjectId,
        // 引用，实际上是说，存储时根据关联进行索引出分类目录下的值。而不是存进去的值。
        ref: 'Category'
    },

    // 标题
    title: String,
    // 简介
    description: {
        type: String,
        default: ''
    },
    // 文章内容
    content: {
        type: String,
        default: ''
    },
    // 当前时间
    date: String,
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },
    views: {
        type: Number,
        default: 0
    },
    // 评论
    comments: {
        type: Array,
        default: []
    },
    //是否删除
    isDelete: {
        type: Boolean,
        default: false
    }
});