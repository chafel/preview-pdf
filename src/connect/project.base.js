/**
 * 项目库访问
 * 
 * @author wangsu@xmanlegal.com
 */

var agent = require('superagent');
var packer = require('../lib/packer.js');
var conf = require(__dirname + '/../../config/').projectApi;
var logger = require('../lib/logger.js');

var urlBase = conf.baseUrl;

var unpacking = packer.unpacking;

var adap = module.exports = {
    login: function(name, pwd, opts) {

        if (!name || !pwd) {
            return Promise.reject(new Error('missing params'));
        }

        return _send(urlBase + '/user/login', {
            username: name,
            password: pwd
        }, {
            requestId: opts.requestId,
            autoUnpack: false
        }).then(function(response) {

            // 解包尝试. 如果能正常解包, 则是登陆成功
            return unpacking(response.body).then(function() {
                return Promise.resolve(response);
            });

        }).then(function(response) {

            var headers = response.headers;
            var cookieString = headers['set-cookie'] || '';
            var reg = /^(.+?)=(.+?);(\s.*)$/;
            var cookieParts = reg.exec(cookieString);
            var sid = null;

            if (cookieParts[1] === 'connect.sid') {
                sid = cookieParts[2];
                return Promise.resolve(sid);
            } else {
                return Promise.reject(new Error('can not get the session id. please report this error.'));
            }
        });
    },
    logout: function(sid, opts) {
        if (!sid) {
            return Promise.reject(new Error('no login'));
        }

        return _send(urlBase + '/user/logout', {
            sid: sid,
            requestId: opts ? opts.requestId || null : null
        });
    },
    getUserInfo: function(sid, opts) {
        if (!sid) {
            return Promise.reject(new Error('no login'));
        }
        return _send(urlBase + '/user/isLogin', {
            sid: sid,
            requestId: opts ? opts.requestId || null : null
        });
    },
    getProjectInfo: function(pid, sid, opts) {

        if (!pid || !sid) {
            return Promise.reject(new Error('missing params'));
        }

        return _send(urlBase + '/project/info?id=' + pid, {
            sid: sid,
            requestId: opts ? opts.requestId || null : null
        });
    },
    getProjectList: function(sid, opts) {

        if (!sid) {
            return Promise.reject(new Error('missing params'));
        }
        return _send(urlBase + '/project/list', {
            sid: sid,
            requestId: opts ? opts.requestId || null : null
        });
    },
    addTimerecord: function(data, sid, opts) {

        if(!sid || !data.pid || !data.description){
            return Promise.reject(new Error('missing params'));
        }

        var isFloatString = /^\d+(\.\d+){0,1}$/;

        if(!isFloatString.test(data.hour)){
            return Promise.reject(new Error('hour is not a number'));
        }

        return _send(urlBase + '/project/timerecord', {
            sid: sid,
            requestId: opts ? opts.requestId || null : null
        });

    },
    validate: function(sid, cb) {
        cb(null, true);
    }
};



var setHeader = function(proxy, headers) {
    for (var key in headers) {
        if (headers[key]) {
            logger.info('set header %s:%s', key, headers[key]);
            proxy.set(key, headers[key]);
        }
    }
    return proxy;
}

function _send(url, data, opts) {
    var autoUnpack = true;
    opts = opts || data;

    if (opts === data) {
        data = null;
    }

    if (!url || !opts) {
        return Promise.reject(new Error('missing params'));
    }

    autoUnpack = !!opts.autoUnpack;

    // create the common headers
    var header = {
        'Accept': 'application/json',
        'X-Request-ID': opts.requestId || null
    };

    // merge headers
    if (opts.headers) {
        for (var key in opts.headers) {
            header[key] = opts.headers[key];
        }
    }

    /**
     * TODO: 干掉express的默认ID生成策略后, 这里需要检查id的结果,并更换名称
     */

    // rename session id to connect.sid. 
    if (opts.sid) {
        header['Cookie'] = 'connect.sid=' + opts.sid;
    }

    logger.info('dump header [%j] ', header);

    return new Promise(function(resolve, reject) {

        var proxy = null;

        if (data) {
            // send post
            proxy = setHeader(agent.post(url), header);
            proxy.send(data);
        } else {
            // send get
            proxy = setHeader(agent.get(url), header);
        }

        proxy.end(function(err, response) {
            if (err) {
                reject(err);
            } else {
                logger.debug('Dump response for [url:%s][res:%j][autoUnpack:%s]', url, response.body, autoUnpack);
                if (autoUnpack) {
                    unpacking(response.body).then(resolve, reject);
                } else {
                    resolve(response);
                }
            }
        });
    });
}
