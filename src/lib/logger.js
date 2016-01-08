/**
 * 日志打印,log4js包装
 */

var log4js = require('log4js');

// global configure.
var config = require(__dirname + '/configure.js');
var utils = require('util');
var randomof = require('random-of');

var LEVELS = {
    // 没可能用all来打log
    'ALL': {
        level: -1,
        name: 'all'
    },
    'TRACE': {
        level: 0,
        name: 'trace'
    },
    'DEBUG': {
        level: 100,
        name: 'debug'
    },
    'INFO': {
        level: 200,
        name: 'info'
    },
    'WARN': {
        level: 300,
        name: 'warn'
    },
    'ERROR': {
        level: 400,
        name: 'error'
    },
    'FATAL': {
        level: 500,
        name: 'fatal'
    }
};

var info = console,
    error = console,
    logHttp = console;

var getLevelNum = function(type) {
    return LEVELS[type.toUpperCase()];
};

var errorThreshold = getLevelNum('WARN');

var limit = getLevelNum(config.logLevel || 'info').level;

// debugger;
// 创建输出方法.
var buildLogger = function(info, err) {
    var item = null;

    var makeHandle = function(output, method) {
        return function(info) {
            output[method](info);
        }
    };

    for (var key in LEVELS) {
        if (key !== 'ALL') {
            item = LEVELS[key];
            if (item.level >= errorThreshold.level) {
                item.output = makeHandle(err, item.name);
            } else {
                item.output = makeHandle(info, item.name);
            }
        }
    }
};


// get config
try {
    log4js.configure(config.logConfig);
    // allway get hold all output target.
    info = log4js.getLogger('info');
    error = log4js.getLogger('error');
    logHttp = log4js.getLogger('http');

    buildLogger(info, error);
} catch (e) {
    // by default, use the console
    console.error(e && e.stack);
    log4js.configure({
        appenders: [{
            type: 'console',
        }]
    });
    buildLogger(log4js.getLogger('console'), log4js.getLogger('console'));
}


var arrSlice = Array.prototype.slice;

function argumentToArray(args, start, len) {
    return arrSlice.call(args, start, len);
}

function newReqId() {
    var str = randomof.getStr('10');
    var timestamp = Date.now().toString(36);
    return ('Q-' + timestamp + '-' + str).toUpperCase();
}

var logger = {
    LEVELS: LEVELS,
    _log4js: log4js,
    _log: function(type, args) {
        var level = getLevelNum(type);
        var levelNum = level.level;
        var levelName = level.name;

        if (level.level < limit || !args || args.length === 0) {
            // ignore 
            return;
        } else {
            level.output(utils.format.apply(utils, args));
        }
    },
    trace: function() {
        logger._log('trace', arguments);
    },
    debug: function() {
        logger._log('debug', arguments);
    },
    info: function() {
        logger._log('info', arguments);
    },
    warn: function() {
        logger._log('warn', arguments);
    },
    error: function() {
        logger._log('error', arguments);
    },
    fatal: function() {
        logger._log('fatal', arguments);
    },
    serviceNotice: function(req, res, next) {

        var notices = [];
        var startTime = Date.now();

        var url = req.url;
        var method = req.method;

        var headers = req.headers;

        var referer = headers['referer'] || 'Null';
        var ua = headers['user-agent']  || 'Null';
        var xForwarded = headers['x-forwarded-for'] || 'Null';
        var clienIp = headers['x-real-ip'] || req.socket.remoteAddress;

        // 获取或生成REQ_ID, 该值将同时传入后端
        var reqId = headers['x-request-id'] || newReqId();

        res.pushNotice = pushNotice;

        pushNotice('REQ-ID:' + reqId);
        pushNotice('CLIENT-IP:' + clienIp);
        pushNotice('METHOD:' + method);
        pushNotice('URL:' + url);
        pushNotice('REFERER:' + referer);
        pushNotice('USER-AGENT:' + ua);
        pushNotice('X-FORWARDED-FOR:' + xForwarded);
        
        // 附加到req请求上, 其它应用中任何位置从这里取值.
        req.requestId = reqId;

        // 设置向前响应同样包含REQ_ID
        res.setHeader('X-Request-ID', reqId);

        // 最终输出
        res.on('finish', function() {
            var cost = ((Date.now() - startTime));
            pushNotice('STATUS_CODE:%s', res.statusCode);
            pushNotice('STATUS_MESSAGE:%s', res.statusMessage);
            pushNotice('TOTAL-COST:' + cost + 'ms');
            logHttp.info(notices.join(';'));
        });

        function pushNotice(str) {

            var argsLen = arguments.length;

            if (argsLen === 0) {
                // nothing
                return;
            }

            var logbody = '';

            if (argsLen == 1) {
                logbody = str;
            } else {
                logbody = utils.format(str, argumentToArray(arguments, 1));
            }

            notices.push('[' + logbody + ']');
        };

        next();
    }
};

logger.log = logger.info;
logger.notify = logger.info;
logger.dev = logger.debug;

config.getLogger = function() {
    return logger;
}

logger.info('[Message:LOGGER READY];[Outlimit:%s];[ErrorThreshold:%s];', config.logLevel, errorThreshold.name.toUpperCase());

module.exports = logger;
