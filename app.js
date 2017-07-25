// 加载express
var express = require('express');
//创建app应用，相当于=>Node.js Http.createServer();
var app = express();
app.get('/', function (req, res, next) {
    // res.send('<h1>欢迎光临我的博客！</h1>');
    /*
    * 读取指定目录下的指定文件，解析并返回给客户端
    * 第一个参数：模板文件，相对于views目录,views/index.html
    * */

    res.render('index');
});
//监听http请求
app.listen(9001);
console.log('it is runing in http://localhost:9001/');

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

swig.setDefaults({ cache: false });