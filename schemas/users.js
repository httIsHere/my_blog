var mongoose = require('mongoose');//引入模块


// 通过mongoose.Schema构造函数，生成一个Schema对象。
var Schema = mongoose.Schema;
// 返回用户的表结构
module.exports = new mongoose.Schema({
    // 用户名
    username: String,
    // 密码
    password: String,
    // 是否管理员
    isAdmin: {
        type: Boolean,
        default: false
    },
    headimg: {
        type: String,
        default: '../../public/headimg/default.jpg'
    },
    focus: {
        type: Array,
        default: []
    },
    fans: {
        type: Array,
        default: []
    },
    like: {
        type: Array,
        default: []
    },
    direction: String,
    position: String,
    address: String,
    gender: String,
    birthday: String,
    description: String,
    date: String
});