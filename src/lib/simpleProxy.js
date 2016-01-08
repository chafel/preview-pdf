/**
 * 转发请请到后端服务
 */

var http = require('http');
var path = require('path');
var url = require('url');
var clone = require('clone');
var logger = require('../lib/logger.js');
/**
 * 创建一个转发请求到固定位置的中间件
 * @param  {[type]} opts [配置信息, ]
 *                      {
 *                      	// 重定向目标服务器地址
 *                      	target:'http://a.b.c:n/d/e/f',
 *                      	// 允许转发的方法
 *                      	allow:['GET', 'POST', 'PUT', 'DELETE']
 *                      }
 * @return {[type]}      [function]  express的中间件方法
 */
module.exports = function createProxy(opts) {

    if (!opts) {
        throw new Error('options is required!');
    }
    var forwardTo = opts.target;
    var allowMethods = opts.allow || ['GET', 'POST', 'PUT', 'DELETE'];

    if(forwardTo.substr(-1) !== '/'){
    	forwardTo += '/';
    }

    var joinUrl = function(part){
    	if(part.substr(0,1) !== '/'){
    		return forwardTo + part;
    	}else{
    		return forwardTo + part.substr(1);
    	}
    };

    logger.info('create proxy to [%s], allow methocs: %j', forwardTo, allowMethods);

    return function(req, res, next) {
        // 完整的访问URL
        var urlOrigin = req.url;

        // 去掉前缀
        var urlRest = urlOrigin.replace(req.baseUrl, '');
        var proxyTo =joinUrl(urlRest);

        // 目标地址
        var proxyParams = url.parse(proxyTo);
        var methodName = req.method.toUpperCase();

        // 请求header
        proxyParams.headers = clone(req.headers);
        proxyParams.headers['connection'] = 'close';
        proxyParams.headers['X-Real-IP'] = proxyParams.headers['X-Real-IP']  || req.socket.remoteAddress;
        proxyParams.headers['X-Request-ID'] = req.requestId;
        // 删除header中不应存在的.
        delete proxyParams.headers.host

        if (allowMethods.indexOf(methodName) === -1) {
            var err = new Error('Method Not Allowed.');
            err.code = 405;
            return next(err);
        }else{
            proxyParams.method = methodName;
        }

        proxyParams.method = methodName;
        var headerXForwredFor = [];

        // 如果请求是从其它位置转发过来的,需要记录转发路径.
        if (proxyParams.headers['X-Forwarded-For']) {
            headerXForwredFor.push(proxyParams.headers['X-Forwarded-For']);
        }

        // 需要保证顺序, 由socket获取的remoteAddress必须在最后.
        headerXForwredFor.push(proxyParams.headers['X-Real-IP']);

        // set the header record the real path for the client passed
        proxyParams.headers['X-Forwarded-For'] = headerXForwredFor.join(',');

        logger.info('PROXY:REQ:[from:%s:%s][to:%s]', methodName, urlOrigin, proxyTo);
        logger.debug('PROXY:DUMP_REQ_OPTS:[%j]', proxyParams);

        // Create proxy Request
        var proxyReq = http.request(proxyParams);

        req.pipe(proxyReq);

        proxyReq.on('response', function(proxyResponse) {

            res.statusCode = proxyResponse.statusCode;
            res.statusMessage = proxyResponse.statusMessage;

            logger.debug('PROXY:DUMP_RES_HEADER:[%j]',proxyResponse.rawHeaders);

            // 重置响应头
            for (var key in proxyResponse.headers) {
                res.setHeader(key, proxyResponse.headers[key]);
            }

            // proxyResponse.on('data',function(data){
            //     logger.debug('PROXY:DUMP_DATA_TRUCK:[%s]',data.toString());
            //     res.write(data);
            // })

            // proxyResponse.on('end',function(data){

            //     if(data){
            //         res.write(data);
            //     }

            //     if(proxyResponse.trailers){
            //         logger.debug('PROXY:DUMP_RES_TRAILERS:[%j]',proxyResponse.rawTrailers);
            //         res.addTrailers(proxyResponse.trailers);
            //     }

            //     res.end();
            // })

            proxyResponse.pipe(res);
        });

        proxyReq.on('error',function(err){
        	var error = new Error('Service unavailable');
        	error.code = 503;
        	logger.warn(err);
        	next(error);
        })
    };
}
