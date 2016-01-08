/**
 * 项目预览功能访问
 * 
 * @author wangsu@xmanlegal.com
 */


var simpleProxy = require('../lib/simpleProxy.js');

var conf = require(__dirname + '/../../config/').backends;

if(!conf || !conf.preview || !conf.preview.url){
	throw new Error('Lost backend configure for [module-preview]');
}

var adap = module.exports = {
    proxy: simpleProxy({
        target: conf.preview.url
    })
};
