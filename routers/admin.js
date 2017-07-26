var express = require('express');

// 创建一个路由对象，此对象将会监听admin文件下的url
var router = express.Router();

//获得数据函数
function renderAdminTable(obj, type, limit, _query) {
    router.get('/' + type + '/', function (req, res, next) {
        var page = req.query.page || 1;
        var count = 0;

        obj.count().then(function (_count) {
            count = _count;
            var pages = Math.ceil(count / limit);
            page = Math.min(page, pages);
            page = Math.max(page, 1);

            var skip = (page - 1) * limit;
            /*
            * sort方法排序，根据id，
            * */
            var newObj = _query ? obj.find().sort({ _id: -1 }).limit(limit).skip(skip).populate(_query) : obj.find().sort({ _id: -1 }).limit(limit).skip(skip);
            newObj.then(function (data) {
                console.log(data);
                res.render('admin/' + type + '_index', {
                    type: type,
                    userInfo: req.userInfo,
                    data: data,
                    page: page,
                    pages: pages,
                    limit: limit,
                    count: count
                });
            });
        });//获取总页数
    });
}

//加载主页
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

// 请求模型中的User.js。
var User = require('../models/User');
//加载“用户管理”数据
renderAdminTable(User, 'user', 5, '');

//分类管理
// 添加分类及保存方法：post
var Category = require('../models/Categories');
//获得分类数据
renderAdminTable(Category, 'category', 2, '');
//添加分类
router.post('/category/', function (req, res, next) {
    //处理前端数据
    //添加分类
    if (req.body.cateName != null) {
        var name = req.body.cateName || '';
        if (name === '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '提交的内容不得为空！',
                operation: {
                    url: 'javascript:window.history.back()',
                    operation: '返回上一步'
                }
            });
        }
        else {
            // 查询数据是否为空
            Category.findOne({
                name: name
            }).then(function (rs) {
                if (rs) {//数据库已经有分类
                    res.render('admin/error', {
                        userInfo: req.userInfo,
                        message: '数据库已经有该分类了哦。',
                        operation: {
                            url: 'javascript:window.history.back()',
                            operation: '返回上一步'
                        }
                    });
                    return Promise.reject();
                } else {//否则表示数据库不存在该记录，可以保存。
                    return new Category({
                        name: name
                    }).save();
                }
            }).then(function (newCategory) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '分类保存成功！',
                    operation: {
                        url: 'javascript:window.history.back()',
                        operation: '返回上一步'
                    }
                })
            });
        }
    }
    //分类修改
    else if (req.body.edit_cateName != null) {
        var id = req.query.id || '';
        var edit_name = req.body.edit_cateName || edit_name;
        if (edit_name === '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '提交的内容不得为空！',
                operation: {
                    url: 'javascript:window.history.back()',
                    operation: '返回上一步'
                }
            });
        }
        else {
            Category.findOne({
                _id: id
            }).then(function (category) {
                if (!category) {
                    res.render('admin/error', {
                        userInfo: req.body.userInfo,
                        message: '分类信息不存在！'
                    });
                    return Promise.reject();
                } else {
                    // 如果用户不做任何修改就提交
                    if (edit_name == category.name) {
                        res.render('admin/success', {
                            userInfo: req.body.userInfo,
                            message: '修改成功！',
                            operation: {
                                url: '/admin/category',
                                operation: '返回分类管理'
                            }
                        });
                        return Promise.reject();
                    } else {
                        // id不变，名称是否相同
                        Category.findOne({
                            _id: { $ne: id },
                            name: edit_name
                        }).then(function (same) {

                            if (same) {
                                res.render('admin/error', {
                                    userInfo: req.body.userInfo,
                                    message: '已经存在同名数据！'
                                });
                                return Promise.reject();
                            } else {

                                Category.update({
                                    _id: id
                                }, {
                                        name: edit_name
                                    }).then(function () {
                                        res.render('admin/success', {
                                            userInfo: req.body.userInfo,
                                            message: '修改成功！',
                                            operation: {
                                                url: '/admin/category',
                                                operation: '返回分类管理'
                                            }
                                        });
                                    });
                            }
                        });
                    }
                }
            });
        }
    }
});
//修改分类信息
// 分类修改
router.get('/category/edit', function (req, res, next) {
    // 获取修改的分类信息，并以表单的形式呈现，注意不能用body，_id是个对象，不是字符串
    var id = req.query.id || '';
    // 获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在！'
            });
            return Promise.reject();
        } else {
            res.render('admin/edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});
//分类保存
router.post('/category/edit/', function (req, res, next) {
    var id = req.query.id || '';

    var name = req.body.name || name;
    Category.findOne({
        _id: id
    }).then(function (category) {

        if (!category) {
            res.render('admin/error', {
                userInfo: req.body.userInfo,
                message: '分类信息不存在！'
            });
            return Promise.reject();
        } else {
            // 如果用户不做任何修改就提交
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.body.userInfo,
                    message: '修改成功！',
                    operation: {
                        url: '/admin/category',
                        operation: '返回分类管理'
                    }
                });
                return Promise.reject();
            } else {
                // id不变，名称是否相同
                Category.findOne({
                    _id: { $ne: id },
                    name: name
                }).then(function (same) {

                    if (same) {
                        res.render('admin/error', {
                            userInfo: req.body.userInfo,
                            message: '已经存在同名数据！'
                        });
                        return Promise.reject();
                    } else {

                        Category.update({
                            _id: id
                        }, {
                                name: name
                            }).then(function () {
                                res.render('admin/success', {
                                    userInfo: req.body.userInfo,
                                    message: '修改成功！',
                                    operation: {
                                        url: '/admin/category',
                                        operation: '返回分类管理'
                                    }
                                });
                            });


                    }
                });
            }
        }
    });
});
// 分类的删除
router.get('/category/delete', function (req, res) {
    var id = req.query.id;

    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('/admin/error', {
                userInfo: req.body.userInfo,
                message: '该内容不存在于数据库中！',
                operation: {
                    url: '/admin/category',
                    operation: '返回分类管理'
                }
            });
            return Promise.reject();
        } else {
            return Category.remove({
                _id: id
            })
        }
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.body.userInfo,
            message: '删除分类成功！',
            operation: {
                url: '/admin/category',
                operation: '返回分类管理'
            }
        });
    });
});

//文章管理
// 内容管理
var Content = require('../models/Contents');
renderAdminTable(Content, 'content', 5, ['category','user']);

// 添加文章
router.get('/content/add', function (req, res, next) {
    Category.find().then(function (categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    })
});
// 内容保存
router.post('/content/add', function (req, res, next) {
    if (req.body.categories.trim() == '') {
        res.render('admin/error', {
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
        res.render('admin/error', {
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
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容忘了填！',
            operation: {
                url: 'javascript:window.history.back()',
                operation: '返回上一步'
            }
        });
        return Promise.reject();
    }
    console.log(req.userInfo);
    new Content({
        category: req.body.categories,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content,
        date: new Date().toLocaleString(),
        user:req.userInfo._id
    }).save().then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '文章发布成功！',
            operation: {
                url: 'javascript:window.history.back()',
                operation: '返回上一步'
            }
        });
    });
});
//内容修改
router.get('/content/edit', function (req, res, next) {
    var id = req.query.id || '';

    Content.findOne({
        _id: id
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该文章id事先已被删除了。'
            });
            return Promise.reject();
        } else {
            Category.find().then(function (categories) {
                //     Category.findOne({
                //         _id: content.category._id.toString()
                //     }).then(function (cate) {
                // console.log(cate);
                res.render('admin/content_edit', {
                    userInfo: req.userInfo,
                    categories: categories,
                    data: content
                });
                // });
            });
        }
    });
});
// 保存文章修改
router.post('/content/edit', function (req, res, next) {
    var id = req.query.id || '';
    console.log(req.body);
    Content.findOne({
        _id: id
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
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
        res.render('admin/success', {
            userInfo: req.body.userInfo,
            message: '修改成功！',
            operation: {
                url: '/admin/content',
                operation: '返回分类管理'
            }
        });
    });
});
router.get('/content/delete', function (req, res, next) {
    var id = req.query.id || '';

    Content.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除文章成功！',
            operation: {
                url: '/admin/content',
                operation: '返回分类管理'
            }
        });
    });
});
module.exports = router;//把router的结果作为模块的输出返回出去！