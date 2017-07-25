var express = require('express');

// 创建一个路由对象，此对象将会监听api文件夹下的url
var router = express.Router();
// 请求模型中的User.js。
var User = require('../models/User');

// 统一返回格式
var responseData = null;

router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }

    next();
});

router.post('/user/register', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;

    //基本验证
    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名不得为空！';
        res.json(responseData);
        return;
    }

    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不得为空！';
        res.json(responseData);
        return;
    }

    if (repassword !== password) {
        responseData.code = 3;
        responseData.message = '两次密码不一致！';
        res.json(responseData);
        return;
    }

    // 用户名是否被注册？
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            responseData.code = 4;
            responseData.message = '该用户名已被注册！';
            res.json(responseData);
            return;
        } else {//保存用户名信息到数据库中
            var user = new User({
                username: username,
                password: password,
            });
            return user.save();
        }
    }).then(function (newUserInfo) {
        console.log(newUserInfo);
        responseData.message = '注册成功！';
        res.json(responseData);
    });

});

module.exports = router;//把router的结果作为模块的输出返回出去！