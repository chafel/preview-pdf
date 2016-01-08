/**
 * 数据库连接
 * @type {Object}
 */
module.exports = function(conf) {
    return {
        mongodb: 'mongodb://127.0.0.1:27017/' + conf.moduleName + '?w=1'
    };
}
