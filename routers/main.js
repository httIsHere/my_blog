var express = require('express');

// 创建一个路由对象，此对象将会监听前台文件夹下的url
var router = express.Router();

var Category = require('../models/Categories');
var Content = require('../models/Contents');
var User = require('../models/User');

var marked = require('marked');
marked.setOptions({
    renderer: new marked.Renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});
// console.log(marked('`i am marked`'));
router.get('/', function (req, res, next) {
    // 读取分类信息
    Category.find().then(function (categories) {
        // console.log(categories);
        res.render('main/index', {
            userInfo: req.userInfo,
            categories: categories
        });
    });
});
//文章展示页
router.get('/article', function (req, res, next) {
    var data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: [],
        count: 0,
        page: Number(req.query.page || 1),
        limit: 3,
        pages: 0
    };
    var where = {};
    if (data.category) {
        where.category = data.category
    }
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
        data.contents = contents;
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
module.exports = router;//把router的结果作为模块的输出返回出去！