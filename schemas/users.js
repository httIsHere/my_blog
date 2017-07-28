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
    isAdmin:{
        type:Boolean,
        default:false
    },
    headimg: {
        type:String,
        default:'http://upload.jianshu.io/users/upload_avatars/6080416/5c0f8fde-fbfe-424c-9b75-2dd20a3d8aa5.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/240/h/240'
    },
    focus:{
        type: Array,
        default: []
    },
    fans:{
        type: Array,
        default: []
    },
    like:{
        type: Array,
        default: []
    }
});