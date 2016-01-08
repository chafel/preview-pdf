module.exports = function(config) {
    return {
        extract: config.HOME + '/' + config.moduleName + '/files/extract',
        store: config.HOME + '/' + config.moduleName + '/files/store',
        tmp: config.HOME + '/' + config.moduleName + '/files/tmp'
    };
}