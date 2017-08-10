var express = require('express');

// 创建一个路由对象，此对象将会监听api文件夹下的url
var router = express.Router();
//用于文件移动保存
var fs = require("fs");
// 请求模型中的User.js。
var User = require('../models/User');
var Content = require('../models/Contents');

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

    // 用户名是否被注册？
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            responseData.code = 4;
            responseData.message = '该用户名已被注册！';
            res.json(responseData);
            return;
        }
        else {//保存用户名信息到数据库中
            var user = new User({
                username: username,
                password: password,
                date: new Date().toLocaleString().replace(/:\d{1,2}$/,' ')
            });
            return user.save();
        }
    }).then(function (newUserInfo) {
        responseData.message = '注册成功！';
        req.cookies.set('userInfo', JSON.stringify(newUserInfo));
        console.log(responseData);
        res.json(responseData);
        return;
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
        console.log
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误！';
            res.json(responseData);
            return;
        }
        else {
            responseData.message = '登录成功！';
            responseData.userInfo = userInfo;
            req.cookies.set('userInfo', JSON.stringify({
                username: userInfo.username,
                _id: userInfo._id,
                headimg: userInfo.headimg,
                isAdmin: userInfo.isAdmin,
                focus:userInfo.focus,
                fans:userInfo.fans
            }));
            console.log(responseData);
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
// 评论提交
router.post('/comment/post', function (req, res, next) {
    // 文章的id是需要前端提交的。
    var contentId = req.body.contentId || '';
    if (req.body.content === '') {
        responseData.message = '评论不可为空';
        res.json(responseData);
    }
    else {
        var postData = {
            id: req.userInfo._id.toString(),
            username: req.userInfo.username,
            postTime: new Date().toLocaleString().replace(/:\d{1,2}$/,' '),
            content: req.body.content
        };
        // 查询当前内容信息
        Content.findOne({
            _id: contentId
        }).then(function (content) {
            content.comments.push(postData);
            content.commentsCnt++;
            content.views--;
            return content.save()
        }).then(function (newContent) {//最新的内容在newContent！
            responseData.message = '评论成功';
            res.json(responseData);
        })
    }


});
//like this article
router.post('/comment/liked', function (req, res, next) {
    // 文章的id是需要前端提交的。
    var contentId = req.body.contentId || '';
    // 查询当前内容信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.liked++;
        content.views--;
        return content.save()
    }).then(function (newContent) {//最新的内容在newContent！
        responseData.message = '评论成功';
        res.json(responseData);
    })
});
//focus this user
router.post('/focus', function (req, res, next) {
    var id = req.body.id || '';
    var name = req.body.name;
    var userId = req.userInfo._id.toString();
    console.log(id + " " + userId);
    //查询是否已关注，已关注则取消关注
    var isFan = -1;
    User.findOne({
        _id: id
    }).then(function (user) {
        //遍历粉丝数组？
        for (var i = 0; i < user.fans.length; i++) {
            if (user.fans[i].name == req.userInfo.username) {
                isFan = i;
                break;
            }
        }
        //是fan就取消关注，不是则关注
        if (isFan != -1) {
            //取消
            user.fans.splice(isFan, 1);
            user.save();
        }
        else {
            user.fans.push({
                id: req.userInfo._id.toString(),
                name: req.userInfo.username
            });
            user.save();
        }
        responseData.nowfans = user.fans.length;
        return User.findOne({ _id: userId });
    }).then(function (nowuser) {
        var focus = -1;
        for (var i = 0; i < nowuser.focus.length; i++) {
            if (nowuser.focus[i].name == id) {
                focus = i;
                break;
            }
        }
        if (isFan != -1) {
            //取消
            nowuser.focus.splice(focus, 1);
            responseData.message = '取关成功';
            nowuser.save();
        }
        else {
            nowuser.focus.push({
                id: id,
                name: name,
                focus:req.body
            });
            responseData.message = '关注成功';
            nowuser.save();
        }
        console.log(responseData);
        res.json(responseData);
    });
});
//upload image
router.post('/uploadImage', function (req, res, next) {
    //后缀
    var type = 'jpg';
    var data = req.body.data;
    //去掉图片base64码前面部分data:image/png;base64
    var base64 = data.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64, 'base64');
    var num = Math.random();
    var filename = req.userInfo._id.toString() + '_' + num + '.' + type;
    var des_file = "public\\contentimg\\" + filename;
    fs.writeFile(des_file, dataBuffer, function (err) {
        if (err) {
            console.log(err);
        }
        else {
                responseData.result = 'ok';
                responseData.image = "../../public/contentimg/" + filename;
                res.json(responseData);
        }
    });
});
//upload cover image
router.post('/coverImage', function (req, res, next) {
    //后缀
    var type = 'jpg';
    var data = req.body.data;
    //去掉图片base64码前面部分data:image/png;base64
    var base64 = data.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64, 'base64');
    var num = Math.random();
    var filename = req.userInfo._id.toString() + '_' + num + '.' + type;
    var des_file = "public\\coverimg\\" + filename;
    fs.writeFile(des_file, dataBuffer, function (err) {
        if (err) {
            console.log(err);
        }
        else {
                responseData.result = 'ok';
                responseData.image = "../../public/coverimg/" + filename;
                res.json(responseData);
        }
    });
});
module.exports = router;//把router的结果作为模块的输出返回出去！