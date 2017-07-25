var express = require('express');

// 创建一个路由对象，此对象将会监听admin文件下的url
var router = express.Router();

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        // 如果当前用户不是管理员
        res.send('不是管理员！');
        return;
    } else {
        next();
    }
});

//加载主页
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});
// router.get('/user/', function (req, res, next) {
//     res.render('admin/user_index', {
//         userInfo: req.userInfo
//     })
// });


// 请求模型中的User.js。
var User = require('../models/User');
//加载“用户管理”数据
User.find().then(function (user) {
    router.get('/user/', function (req,res,next) {
        res.render('admin/user_index',{
            userInfo:req.userInfo,
            users:user
        })
    })
});

module.exports = router;//把router的结果作为模块的输出返回出去！