module.exports = function(config) {

    return {
        extract: config.CWD + '/files/extract',
        store: config.CWD + '/files/store',
        tmp: config.CWD + '/files/tmp'
    };

}
