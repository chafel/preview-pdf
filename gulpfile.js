var config = require('./config/');
var gulp = require('gulp');
var path = require('path');

var pluginAt = config.CWD + '/dev/gulpfiles/';

var todoList = [];

// getTask('release');
// config.envType

// 公共任务, 先清理
getTask('clean', {
    target: [
        // 目前只有三个位置, css, js , tpl, 后续有其它的再添加
        config.CWD + '/web/static/' + config.moduleName + '/script/*.js',
        config.CWD + '/web/static/' + config.moduleName + '/css/*.css',
        config.CWD + '/web/static/' + config.moduleName + '/tpl/*.js'
    ]
});

// 合并并压缩公共css
getTask('merge_css', {
    src: [
        config.CWD + '/web/static/css/cssreset.css',
        config.CWD + '/web/static/css/bootstrap.min.css'
    ],
    releaseName: 'common.css',
    target: config.CWD + '/web/static/' + config.moduleName + '/css',
    minify: true,
    cleanBefore: true
});

// JS检查
getTask('jshint', {
    src: ['!./web/static/script/*.min.js', './web/static/script/*.js']
});

switch (config.envType) {
    case "PRODUCT":

        // 产品模式, 线上压缩CSS,
        getTask('merge_css', {
            src: [
                config.CWD + '/web/static/css/*.css'
            ],
            releaseName: 'release.css',
            target: config.CWD + '/web/static/' + config.moduleName + '/css/',
            minify: true,
        });

        // // ugliffy lib库
        // getTask('uglify', {
        //     src: [config.CWD + '/web/static/script/lib/*.min.js'],
        //     target: './web/static/' + config.moduleName + '/script/lib/'
        // });

        // uglify代码
        getTask('uglify', {
            src: [
                config.CWD + '/web/static/script/word2html.js', 
                config.CWD + '/web/static/script/doclist.js',
                config.CWD + '/web/static/script/worongLevel.js'
             ],
            target: './web/static/' + config.moduleName + '/script/'
        });

        // 产品模式, 编译械版, 但不watch
        getTask('buildTemplate', {
            src: [config.CWD + '/web/tpl/*.html'],
            tplBase: config.CWD + '/web/tpl/',
            target: config.CWD + '/web/static/' + config.moduleName + '/tpl/',
            enableWatch: false
        });

        break
    case "DEBUG":

        // 产品debug模式, 不压缩
        getTask('merge_css', {
            src: [
                config.CWD + '/web/static/css/*.css'
            ],
            releaseName: 'release.css',
            target: config.CWD + '/web/static/' + config.moduleName + '/css/',
            minify: false,
        });

        // // 仅移动,不进行ugliffy
        // getTask('move', {
        //     src: [config.CWD + '/web/static/script/lib/*.min.js'],
        //     target: './web/static/' + config.moduleName + '/script/lib/'
        // });

        // 仅移动,不进行ugliffy
        getTask('move', {
            src: [
                config.CWD + '/web/static/script/word2html.js', 
                config.CWD + '/web/static/script/doclist.js',
                config.CWD + '/web/static/script/wrongLevel.js'
            ],
            target: './web/static/' + config.moduleName + '/script/'
        });

        // 产品模式, 不watch
        getTask('buildTemplate', {
            src: [config.CWD + '/web/tpl/*.html'],
            tplBase: config.CWD + '/web/tpl/',
            target: config.CWD + '/web/static/' + config.moduleName + '/tpl/',
            enableWatch: false
        });

        break
    case "DEV":
    default:

        // watch 模版变更
        getTask('buildTemplate', {
            src: [config.CWD + '/web/tpl/*.html'],
            tplBase: config.CWD + '/web/tpl/',
            target: config.CWD + '/web/static/' + config.moduleName + '/tpl/',
            enableWatch: true
        });

}

gulp.task('default', todoList, function() {
    console.log('Finish building!!! cd%s ', new Date());
});

/**
 * 获取一个gulp任务. 并自动创建依赖.
 * 
 * @param  {[type]} name    [description]
 * @param  {[type]} context [description]
 * @return {[type]}         [description]
 */
function getTask(name, context) {
    var fullpath = pluginAt + name + '.gulpfile.js';
    context = context || {};
    context.cwd = config.CWD;

    var deps = todoList.length === 0 ? [] : [todoList[todoList.length - 1]];
    console.log('deps: %s', deps);
    todoList.push(require(fullpath)(gulp, context, deps));
}
