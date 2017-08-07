var express = require('express');

// 创建一个路由对象，此对象将会监听前台文件夹下的url
var router = express.Router();

var Category = require('../models/Categories');
var Content = require('../models/Contents');
var User = require('../models/User');

var marked = require('marked');

var multer = require('multer');//用于上传文件
//用于文件移动保存
var fs = require("fs");

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

router.get('/', function (req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],
        count: 0,
        page: Number(req.query.page || 1),
        limit: 5,
        pages: 0,
        users: []
    };

    Category.find().then(function (categories) {
        data.categories = categories;
    });
    User.count().then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.floor(Math.random()*data.pages)+1;
        console.log(data.page);
        // 取值不超过pages
        data.page = Math.min(data.page, data.pages);
        // 取值不小于1
        data.page = Math.max(data.page, 1);
        console.log(data.page);
        // skip不需要分配到模板中，所以忽略。
        var skip = (data.page - 1) * data.limit;
        return User.find().limit(data.limit).skip(skip).sort({ date: -1 });
    }).then(function (users) {
        console.log(users);
        for (var j = 0; j < users.length; j++) {
            var isFan = -1;
            for (var i = 0; i < users[j].fans.length; i++) {
                if (users[j].fans[i].name == req.userInfo.username) {
                    isFan = i;
                    break;
                }
            }
            if (isFan != -1) {
                users[j].myFan = true;
            }
            else {
                users[j].myFan = false;
            }
        }
        data.users = users;
        console.log(data);
        res.render('main/index', data);
    });
    // User.find().then(function (users) {
    //     // for (user in users) {
    //     for (var j = 0; j < users.length; j++) {
    //         var isFan = -1;
    //         for (var i = 0; i < users[j].fans.length; i++) {
    //             if (users[j].fans[i].name == req.userInfo.username) {
    //                 isFan = i;
    //                 break;
    //             }
    //         }
    //         if (isFan != -1) {
    //             users[j].myFan = true;
    //         }
    //         else {
    //             users[j].myFan = false;
    //         }
    //     }
    //     data.users = users;
    //     console.log(data);
    //     res.render('main/index', data);
    // });
});
//登录
router.get('/login', function (req, res, next) {
    res.render('main/login');
});
// 注册
router.get('/signup', function (req, res, next) {
    res.render('main/signup');
});
//文章展示页
router.get('/article', function (req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],
        count: 0,
        page: Number(req.query.page || 1),
        limit: 5,
        pages: 0
    };
    var where = {};
    if (data.category) {
        where.category = data.category
    }
    where.isDelete = false;
    // 读取分类信息
    Category.find().then(function (categories) {
        data.categories = categories;

        return Content.where(where).count();
    }).then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        // 取值不超过pages
        data.page = Math.min(data.page, data.pages);
        // 取值不小于1
        data.page = Math.max(data.page, 1);
        // skip不需要分配到模板中，所以忽略。
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).sort({ _id: -1 }).populate(['category', 'user']);
    }).then(function (contents) {
        if (contents.length > 0)
            data.contents = contents;
        else
            data.contents = null;
        console.log(data);//这里有你想要的所有数据
        res.render('main/article', data);
    })
});
//文章详情页
router.get('/view/', function (req, res, next) {
    var contentId = req.query.contentId || '';
    var data = {
        userInfo: req.userInfo,
        categories: [],
        content: null
    };

    Category.find().then(function (categories) {
        data.categories = categories;
        return Content.findOne({ _id: contentId });
    }).then(function (content) {
        data.content = content;
        content.views++;//保存阅读数
        content.save();
        return User.findOne({ _id: data.content.user });
    }).then(function (rs) {
        data.content.user = rs;
        data.category = data.content.category;
        console.log(data);
        res.render('main/view', data);
    });
});
//文章详情页
router.get('/view/get', function (req, res, next) {
    var contentId = req.query.contentId || '';
    var data = {
        userInfo: req.userInfo,
        categories: [],
        content: null
    };

    Category.find().then(function (categories) {
        data.categories = categories;
        return Content.findOne({ _id: contentId });
    }).then(function (content) {
        data.content = content;
        return User.findOne({ _id: data.content.user });
    }).then(function (rs) {
        data.content.user = rs;
        data.category = data.content.category;
        console.log(data);
        res.json(data);
    });
});

//写文章
router.get('/postedit', function (req, res, next) {
    Category.find().then(function (categories) {
        res.render('main/postedit', {
            userInfo: req.userInfo,
            categories: categories
        });
    })
});
router.post('/postedit', function (req, res, next) {
    if (req.body.categories.trim() == '') {
        res.render('main/error', {
            userInfo: req.userInfo,
            message: '分类信息不存在！',
            operation: {
                url: 'javascript:window.history.back()',
                operation: '返回上一步'
            }
        });
        return Promise.reject();
    }

    if (req.body.title.trim() == '') {
        res.render('main/error', {
            userInfo: req.userInfo,
            message: '标题不能为空！',
            operation: {
                url: 'javascript:window.history.back()',
                operation: '返回上一步'
            }
        });
        return Promise.reject();
    }

    if (req.body.content.trim() == '') {
        res.render('main/error', {
            userInfo: req.userInfo,
            message: '内容忘了填！',
            operation: {
                url: 'javascript:window.history.back()',
                operation: '返回上一步'
            }
        });
        return Promise.reject();
    }
    new Content({
        category: req.body.categories,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        date: new Date().toLocaleString(),
        user: req.userInfo._id
    }).save().then(function () {
        res.render('main/success', {
            userInfo: req.userInfo,
            message: '文章发布成功！'
        });
    });
});
//blog-search
router.get('/search', function (req, res, next) {
    var key = req.query.key;
    var type = req.query.type || '';
    console.log(key);
    var data = {
        key:key,
        type:type,
        userInfo: req.userInfo,
        contents: null,
        users: null
    }
    Content.find({
        title:  new RegExp("^.*"+key+".*$")
    }).populate(['category', 'user']).then(function(contents){
        data.contents = contents;
        return User.find({
            username: new RegExp("^.*"+key+".*$")
        });
    }).then(function(users){
        data.users = users;
        console.log(data);
        if(type == "note")
            res.render('main/searchResult',data);
        else
            res.render('main/userResult', data);
    });
});
//文章列表
router.get('/postlist', function (req, res, next) {
    Content.find({
        user: req.userInfo._id,
        isDelete: false
    }).sort({ date: -1 })
        .then(function (contents) {
            console.log(contents);
            res.render('main/postlist', {
                userInfo: req.userInfo,
                contents: contents
            });
        });
});
//文章编辑
router.get('/edit', function (req, res, next) {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).then(function (content) {
        if (!content) {
            res.render('main/error', {
                userInfo: req.userInfo,
                message: '该文章id事先已被删除了。'
            });
            return Promise.reject();
        } else {
            Category.find().then(function (categories) {
                res.render('main/content_edit', {
                    userInfo: req.userInfo,
                    categories: categories,
                    data: content
                });
            });
        }
    });
});
//保存修改
router.post('/edit', function (req, res, next) {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).then(function (content) {
        if (!content) {
            res.render('main/error', {
                userInfo: req.body.userInfo,
                message: '文章id事先被删除了！'
            });
            return Promise.reject();
        } else {
            return Content.update({
                _id: id
            }, {
                    category: req.body.categories,
                    title: req.body.title,
                    description: req.body.description,
                    content: req.body.content
                });
        }
    }).then(function () {
        res.render('main/success', {
            userInfo: req.body.userInfo,
            message: '修改成功！',
            operation: {
                url: '/postlist',
                operation: '返回个人中心'
            }
        });
    });
});
// 文章删除
//delete my article
router.get('/delete', function (req, res, next) {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).then(function () {
        return Content.update({
            _id: id
        }, {
                isDelete: true
            });
    }).then(function () {
        res.render('main/success', {
            userInfo: req.userInfo,
            message: '删除文章成功！',
            operation: {
                url: '/postlist',
                operation: '返回个人中心'
            }
        });
    })
});
//回收站
router.get('/trash', function (req, res, next) {
    Content.find({
        user: req.userInfo._id,
        isDelete: true
    }).then(function (contents) {
        console.log(contents);
        res.render('main/trash', {
            userInfo: req.userInfo,
            contents: contents
        });
    });
});
//recover my article
router.get('/recover', function (req, res, next) {
    var id = req.query.id || '';
    Content.findOne({
        _id: id
    }).then(function () {
        return Content.update({
            _id: id
        }, {
                isDelete: false
            });
    }).then(function () {
        res.render('main/success', {
            userInfo: req.userInfo,
            message: '恢复文章成功！',
            operation: {
                url: '/postlist',
                operation: '返回个人中心'
            }
        });
    })
});
//real delete my article
router.get('/realDelete', function (req, res, next) {
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function () {
        res.render('main/success', {
            userInfo: req.userInfo,
            message: '删除文章成功！',
            operation: {
                url: '/postlist',
                operation: '返回个人中心'
            }
        });
    })
});
//我的博客
router.get('/myArticles', function (req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],
        count: []
    };
    // 读取分类信息
    Category.find().then(function (categories) {
        data.categories = categories;

        return Content.count();
    }).then(function (count) {
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ views: -1 });
    }).then(function (contents) {
        data.contents = contents;
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ liked: -1 });
    }).then(function (rs) {
        data.count = rs;
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ commentsCnt: -1 });
    }).then(function (commentCnt) {
        data.commentCnt = commentCnt;
        return User.findOne({
            _id: req.userInfo._id
        });
    }).then(function (users) {
        data.userInfo = users;
        console.log(data);//这里有你想要的所有数据
        res.render('main/myArticle', data);
    })
});
//following
router.get('/following', function (req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],
        count: [],
        users: []
    };
    // 读取分类信息
    Category.find().then(function (categories) {
        data.categories = categories;

        return Content.count();
    }).then(function (count) {
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ views: -1 });
    }).then(function (contents) {
        data.contents = contents;
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ liked: -1 });
    }).then(function (rs) {
        data.count = rs;
        return Content.find({
            user: req.userInfo._id,
            isDelete: false
        }).sort({ commentsCnt: -1 });
    }).then(function (commentCnt) {
        data.commentCnt = commentCnt;
        return User.findOne({
            _id: req.userInfo._id
        });
    }).then(function (user) {
        data.userInfo.focus = user.focus;
        for (var i = 0; i < user.focus.length; i++) {
            User.findOne({
                _id: user.focus[i].id
            }).then(function (u) {
                data.users.push(u);
            })
        }
        console.log(data);
        res.render('main/following', data);
    });
});


//上传头像
router.get('/uploadHead', function (req, res, next) {
    res.render('main/headimg', {
        userInfo: req.userInfo
    });
});
//头像修改
router.post('/uploadHead', function (req, res, next) {
    //后缀
    var type = 'jpg';
    var data = req.body.image;
    //去掉图片base64码前面部分data:image/png;base64
    var base64 = data.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64, 'base64');
    var filename = req.userInfo._id.toString() + '.' + type;
    var des_file = "public\\headimg\\" + filename;
    fs.writeFile(des_file, dataBuffer, function (err) {
        if (err) {
            console.log(err);
        }
        else {
            //修改数据库的头像信息
            User.findOne({
                _id: req.userInfo._id
            }).then(function (user) {
                user.headimg = "../../public/headimg/" + filename;
                return user.save();
            }).then(function (userInfo) {
                responseData.result = 'ok';
                responseData.image = userInfo.headimg;
                res.json(responseData);
            })
        }
    });
});
router.get('/commentslist', function (req, res, next) {
    //查询用户所有评论
    Content.find({
        user: req.userInfo._id,
        isDelete: false
    }).sort({ date: -1 })
        .then(function (contents) {
            console.log(contents);
            res.render('main/commentslist', {
                userInfo: req.userInfo,
                contents: contents
            });
        });
});
//myTTBLOG
router.get('/myTTBLOG', function (req, res, next) {
    User.findOne({
        _id: req.userInfo._id
    }).then(function (user) {
        res.render('main/myblog', {
            userInfo: user
        });
    });
});
router.post('/myTTBLOG', function (req, res, next) {
    console.log(req.body);
    User.findOne({
        _id: req.userInfo._id
    }).then(function (user) {
        user.position = req.body.position;
        user.gender = req.body.gender;
        user.birthday = req.body.birthday;
        user.direction = req.body.direction;
        user.address = req.body.address;
        user.description = req.body.description;
        return user.save();
    }).then(function (newUser) {
        res.render('main/myblog', {
            userInfo: newUser
        });
    });
});
//look others main page
router.get('/lookHim', function (req, res, next) {
    var id = req.query.id || '';
    console.log(id);
    var data = {
        userInfo: req.userInfo,
        hisInfo: null
    };
    User.findOne({
        _id: id
    }).then(function (userInfo) {
        data.hisInfo = userInfo;
        return Content.find({
            user: id,
            isDelete: false
        }).sort({ views: -1 });
    }).then(function (contents) {
        data.contents = contents;
        console.log(data);
        res.render('main/hisblog', data);
    })
});
module.exports = router;//把router的结果作为模块的输出返回出去！