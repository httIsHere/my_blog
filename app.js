// 加载express
var express = require('express');
//创建app应用，相当于=>Node.js Http.createServer();
var app = express();

// 加载数据库模块
var mongoose = require('mongoose');

// 加载body-parser，用以处理post提交过来的数据
var bodyParser = require('body-parser');

var Cookies = require('cookies');

//cookies save
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    // 解析cookie信息把它由字符串转化为对象
    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));;
            // // 获取当前用户登录的类型，是否管理员
            // User.findById(req.userInfo._id).then(function (userInfo) {
            //     req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
            //     next();
            // });
        } catch (e) {
            next();
        }
    }
    next();
});

//引入静态文件
// 当遇到public文件下的文件，都调用第二个参数里的方法(注意是两个下划线)。
// 当用户访问的url以public开始，那么直接返回对应__dirname+'public'下的文件。因此我们的css应该放到public下。
app.use('/public', express.static(__dirname + '/public'));


// bodyParser设置
app.use(bodyParser.urlencoded({ extended: true }));

// 根据功能划分路由（routers）
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));//后台
app.use('/', require('./routers/main'));//前台

// 定义模板引擎，使用swig.renderFile方法解析后缀为html的文件
var swig = require('swig');
// 第一个参数：模板引擎的名称，同时也是模板引擎的后缀，你可以定义打开的是任何文件格式，比如json，甚至tdl等。
// 第二个参数表示用于解析处理模板内容的方法。
// 第三个参数：使用swig.renderFile方法解析后缀为html的文件。
app.engine('html', swig.renderFile);

// 设置模板存放目录
// 定义目录时也有两个参数，注意，第一个参数必须为views！
// 第二个参数可以是我们所给出的路径。因为之前已经定义了模板文件夹为views。所以，使用对应的路径名为./views。
app.set('views', './views');
// 注册模板引擎
// 第一个参数必须是字符串'view engine'。
// 第二个参数和app.engine方法定义的模板引擎名称（第一个参数）必须是一致的（都是“html”）。
app.set('view engine', 'html');
// 开发过程中，为了减少麻烦，需要取消模板缓存。
swig.setDefaults({ cache: false });


//监听http请求
// mongoose.connect(); 
mongoose.connect('mongodb://localhost:27018/blog', { useMongoClient: true }, function (err) {
    if (err) {
        console.log('error！');
    } else {
        console.log('connection is successed, and it is running in http://localhost:9001/');
        app.listen(9001);
    }
});
// app.listen(9001);