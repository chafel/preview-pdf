/**
 * launcher
 * 
 * @author wangsu@nextlegal.com
 * 
 */

// set root dir
process.chdir(__dirname);

var fs = require('fs');
var path = require('path');
var express = require('express');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var exphbs = require('hbs');
var hbsutils = require('hbs-utils')(exphbs);
require('./src/bothside/lib/tplhelper.js')(exphbs);

var config = require(__dirname + '/src/lib/configure.js');
var logger = require(__dirname + '/src/lib/logger.js');

var sep = path.sep;
var rootdir = process.cwd();
var viewdir = rootdir + sep + 'view' + sep;

var app = express();

// template setting.
app.engine('.hbs', exphbs.__express);

app.set('view engine', '.hbs');
app.set('views', viewdir);

// static resource
var routerForStatic = serveStatic(rootdir + '/web', {
    'index': ['index.html']
});
// static resource
var viewStatic = serveStatic(rootdir + '/view', {
    'index': ['index.html']
});

// 模似公共资源
app.use('/', routerForStatic);

// 前端模版请求位置
app.use('/view', viewStatic);

// 日志输出
app.use(logger.serviceNotice);

// if (config.envType !== 'PRODUCT') {
// } else {
//     // 日志输出
//     app.use(logger._log4js.connectLogger(logger._log4js.getLogger('http'), {
//         level: 'INFO'
//     }));
// }

// 线上只使用端口, 无静态资源, 无子级路径
// app.use('/', service);

app.get('/docs/:id', function(req, res) {
    console.log("+++++++++++++++++++++++");
    var file = req.params.id;
    res.render('docs_detail', {file: file});
  
});

app.get('/docs-list', function(req, res) {

    //var sid = req.cookies['sid'];

    //var userInfo = res.locals.userInfo;

    // 渲染数据源;
    // var data = {
    //     pageParams:{},
    //     username: userInfo.trueName || userInfo.email  || userInfo.mobile || 'Unknown',
    // };

    // 附加页面数据
    // data.pageParams.userId = userInfo.id;
    // data.pageParams.username = userInfo.username;
    // data.pageParams.userType = userInfo.userType;

    var data = {};

    var docPath = __dirname + "/web/docFiles/";
    var filelist = [];
    fs.readdir(docPath, function(err, files) {
      if (err) {
        console.log("read docs error:\n" + err);
      } else {
        for (var i = 0; i < files.length; i++) {
          if (path.extname(files[i]) === '.pdf') {
            filelist.push({'filename': files[i], 'filepath': '/document/docs/' + files[i]});
          }
        }
      }
    });

    data.fileList = filelist;
    logger.debug('Dump project detail data: %j',data);

    //data.pageParams = JSON.stringify(data.pageParams);

    // res.json(data);
    res.render('docs_list', data);
});

 // 非线上跳转到Page
app.all('/', function(req, res) {
		console.log("####### jump");
    res.redirect(config.deployPath + '/');
});

var server = app.listen(9000, '0.0.0.0', function() {

    var host = server.address().address;
    var port = server.address().port;

    logger.info('App listening at http://%s:%s', host, port);
});
