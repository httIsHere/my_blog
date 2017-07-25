var mongoose = require('mongoose');//引入模块


// 通过mongoose.Schema构造函数，生成一个Schema对象。
var Schema = mongoose.Schema;

// new出的Schema对象包含很多内容，传入的对象代表数据库中的一个表。
// 每个属性代表表中的每一个字段，每个值代表该字段存储的数据类型。
// var blogSchema = new Schema({
//     title: String,
//     author: String,
//     body: String,
//     comments: [{ body: String, date: Date }],
//     date: { type: Date, default: Date.now },
//     hidden: Boolean,
//     meta: {
//         votes: Number,
//         favs: Number
//     }
// });
// 返回用户的表结构
module.exports = new mongoose.Schema({
    // 用户名
    username: String,
    // 密码
    password: String
});