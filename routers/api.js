var express = require('express');

// 创建一个路由对象，此对象将会监听api文件夹下的url
var router = express.Router();
// 请求模型中的User.js。
var User = require('../models/User');

// 统一返回格式
var responseData = null;

//返回的数据模板
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }

    next();
});

//用户注册
router.post('/user/register', function (req, res, next) {
    console.log(req.body);
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
// 登录验证
router.post('/user/login', function (req, res, next) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;

    if (username == '' || password == '') {
        responseData.code = 1;
        responseData.message = '用户名和密码不得为空！';
        res.json(responseData);
        return;
    }
    // 查询用户名和对应密码是否存在，如果存在则登录成功
    User.findOne({
        username: username,
        password: password
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误！';
            res.json(responseData);
            return;
        } else {
            responseData.message = '登录成功！';
            responseData.userInfo = userInfo.username;

            //每当用户访问站点，将保存用户信息。
            //把id和用户名作为一个对象存到一个名字为“userInfo”的对象里面。
            req.cookies.set('userInfo', JSON.stringify({
                _id: userInfo._id,
                username: userInfo.username,
                isAdmin: userInfo.isAdmin
            })
            );
            res.json(responseData);
            return;
        }
    });
});
// 退出方法
router.get('/user/logout', function (req, res) {
    req.cookies.set('userInfo', JSON.stringify({
        _id: null,
        username: null
    }));
    res.json(responseData);
    return;
});

module.exports = router;//把router的结果作为模块的输出返回出去！