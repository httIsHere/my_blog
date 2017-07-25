var express = require('express');

// 创建一个路由对象，此对象将会监听前台文件夹下的url
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('main/index', {
        userInfo: req.userInfo
    });
});

module.exports = router;//把router的结果作为模块的输出返回出去！