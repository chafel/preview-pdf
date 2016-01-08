/**
 * Main Configure
 * 
 * @author wangsu@xmanlegal.com
 */
var path = require('path');
var fs = require('fs');
var CWD = path.resolve(__dirname, '../../');
var HOME = process.env.HOME || '/home/work';
var CONFIG_NAME = '.nextlegal_env.js';

var environment = null;
var envType = null;

// 默认的log配置, 不要修改.保持使用console
var logConfig = {
    appenders: [{
        type: 'console',
        category: 'info'
    }, {
        type: 'console',
        category: 'error'
    }, {
        type: 'console',
        category: 'http'
    }]
};

console.log('checking the environment configuration at [%s]', new Date());
console.log('HOME: %s \nCWD: %s ', HOME, CWD);

/**
 * 从环境中载入配置文件. 用于识别线上,测试,开发三种环境
 * 如果环境配置文件不存在, 则直接认为是dev环境.
 */
try {
    environment = require(HOME + '/.nextlegal_env.js');
    console.log('found the [%s]', CONFIG_NAME);
    console.dir(environment);
    envType = (environment.type || 'DEV').toUpperCase();
} catch (e) {
    console.log(e && e.stack);
    console.log('not found [%s]', CONFIG_NAME);
    environment = false;
    envType = 'DEV';
}

console.log('specify the service mode at [%s]', envType);

var basedir = CWD + "/config";

var configDirName = basedir;

var main = null;

/**
 * 确认配置目录是否存在.
 * 如果在product环境,但配置目录不存在时,直接拒绝启动.
 * 如果在测试环境,当test环境的不存在配置目录时, 认为直接使用开发环境和测试环境使用配置相同.
 */
switch (envType) {
    case "PRODUCT":
        configDirName = basedir + '/product';
        if (fs.existsSync(configDirName)) {
            break;
        } else {
            console.error('Fatal, not configure directory for [PRODUCT]. can not start the module');
            process.exit(0);
        }
    case "TEST":
        configDirName = basedir + '/test';
        if (fs.existsSync(configDirName)) {
            break;
        } else {
            console.warn('can not find the configure directory for [TEST] . Try to use the configure directory for [DEV] ');
        }
    case "DEV":
    default:
        configDirName = basedir;
}

/**
 * main 中内容, 主要为文件名称, 端口, 监听位置等. 
 * 一般可以不区分线上和线下. 所以支持仅使用最外面的一个main.config.js文件做为配置.
 */
try {
    main = require(configDirName + '/main.conf.js');
    console.info('OK, Load main configure from [%s] ', configDirName + '/main.conf.js');
} catch (e) {
    try {
        console.warn('Failed, Load main configure from [%s]. [%s]', configDirName + '/main.conf.js', e.message);

        // 判断是否可降级使用更低一级的主配置文件. 如果已经是最低级别, 则拒绝启动
        if (configDirName + '/main.conf.js' !== basedir + '/main.conf.js') {
            main = require(basedir + '/main.conf.js');
            console.info('Load main configure from [%s] ok!', basedir + '/main.conf.js');
        } else {
            throw new Error('main.config.js not exists!');
        }
    } catch (e) {
        console.error('Fatal, can not find the main.config.js. can not start the module!');
        process.exit();
    }
}

var moduleName = main.moduleName;

console.log('moduleName: %s , using the configure directory : [%s]', moduleName, configDirName);

if (environment) {
    /**
     * 生成日志配置信息. 这里的输出路径,使用 ~/.nextlegal_env.js 中的logs所指的路径
     * 这里不使用自定义日志位置, 是由于RD在开发时, 不清楚服务端的日志位置, 防止运维人员在服务端找不到log的情况发生.
     */
    if (envType !== 'DEV' && environment.logs) {

        console.info('the logger output to the directory to [%s]', environment.logs);

        var infoPath = [environment.logs, moduleName, moduleName + '_info.log'].join(path.sep);
        var errPath = [environment.logs, moduleName, moduleName + '_err.log'].join(path.sep);
        var httpPath = [environment.logs, moduleName, 'http.log'].join(path.sep);

        // 清空默认输出配置
        logConfig.appenders = [];

        /**
         * info 用于应用中的正常log输出.
         * @type {String}
         */
        logConfig.appenders.push({
            type: 'dateFile',
            filename: infoPath,
            pattern: '-yyyyMMdd',
            alwaysIncludePattern: true,
            category: 'info'
        });

        /**
         * 模块中的错误信息及警告信息
         * @type {String}
         */
        logConfig.appenders.push({
            type: 'dateFile',
            filename: errPath,
            pattern: '-yyyyMMdd',
            alwaysIncludePattern: true,
            category: 'error'
        });

        /**
         * !!IMPORTANT
         * 
         * 模块的服务信息, 每个请求将输出一条信息, 
         * 用于统计模块任务执行情况, 请求耗时, 任务执行过程等.
         * 重要状态的信息可push到这里, 具体可参照logger中生成的pushNotice方法
         */
        logConfig.appenders.push({
            type: 'dateFile',
            filename: httpPath,
            pattern: '-yyyyMMdd',
            alwaysIncludePattern: true,
            category: 'http'
        });
    }
}

/**
 * 向外导出的配置对像.
 * @type {Object}
 */
var configure = {
    CWD: CWD,
    HOME: HOME,
    envType: envType,
    moduleName: moduleName,
    getEnv: function(name) {
        return environment[name];
    },
    logConfig: logConfig,
    // 日志级别
    logLevel: 'ALL',
    // 模块名称
    moduleName: 'frontend',
    // 监听端口
    port: 8082,
    // 监听地址
    listener: '0.0.0.0',
    // 运行模式
    debug: false,
};

// 复盖导出的默认配置
for (var key in main) {
    configure[key] = main[key];
};

// 同步加载其它配置文件
var files = fs.readdirSync(configDirName);
var isConfig = /^(.*)\.conf\.js$/;
files.forEach(function(name) {
    if (isConfig.test(name)) {
        var base = isConfig.exec(name)[1];
        var content = null;
        // 跳过主配置文件.
        if (base === 'main') {
            return;
        }
        console.log('Load configure file: [ %s ] ok!', name);
        content = require(path.join(configDirName, name));
        if ('function' === typeof content) {
            content = content(configure);
        }
        configure[base] = content;
    }
})

if (configure.debug) {
    console.log('dump configure : %j', configure);
}

module.exports = configure;
