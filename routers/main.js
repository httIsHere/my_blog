var express = require('express');

// 创建一个路由对象，此对象将会监听前台文件夹下的url
var router = express.Router();

var Category = require('../models/Categories');
var Content=require('../models/Contents');

router.get('/', function (req, res, next) {
    // 读取分类信息
    Category.find().then(function(categories){
        // console.log(categories);
        res.render('main/index',{
            userInfo:req.userInfo,
            categories:categories
        });
    });
});
router.get('/article',function(req,res,next){
    var data={
        userInfo:req.userInfo,
        categories:[],
        count:0,
        page:Number(req.query.page||1),
        limit:3,
        pages:0
    };

    // 读取分类信息
    Category.find().then(function(categories){
        data.categories=categories;

        return Content.count();
    }).then(function(count){
        data.count=count;
        //计算总页数
        data.pages=Math.ceil(data.count/data.limit);
        // 取值不超过pages
        data.page=Math.min(data.page,data.pages);
        // 取值不小于1
        data.page=Math.max(data.page,1);
        // skip不需要分配到模板中，所以忽略。
        var skip=(data.page-1)*data.limit;

        return Content.find().limit(data.limit).skip(skip).populate(['category','user']).sort({_id:-1});


    }).then(function(contents){
        data.contents=contents;
        console.log(data);//这里有你想要的所有数据
        res.render('main/article',data);
    })
});
module.exports = router;//把router的结果作为模块的输出返回出去！