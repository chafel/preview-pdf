/**
 * 数据库连接
 * @type {Object}
 */
module.exports = function(conf) {
    return {
        mongodb: 'mongodb://192.168.1.168:27017/' + conf.moduleName + '?w=1'
    };
}
