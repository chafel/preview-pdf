/**
 * 通用工具方法
 * 
 * @author wangsu@xmanlegal.com
 */

var isNotEmpty = function(str) {
    return !!str && str.length > 0;
};

var isSimpleString = function(str) {
    var reg = /^\w+$/ig;
    return isNotEmpty(str) && reg.test(str) && str;
};

var isHashString = function(str) {
    var reg = /^([0-9a-f][0-9a-f])+$/i;
    return isNotEmpty(str) && reg.test(str) && str
};

var isStoreFileName = function(str) {
    var reg = /^F_((?:[0-9a-f][0-9a-f])+)$/i;
    return isNotEmpty(str) && reg.test(str) && reg.exec(str);
};

var me = module.exports = {
    isNotEmpty: isNotEmpty,
    isProjectId: isHashString,
    isFileId: isHashString,
    isVersionId: isHashString,
    isSimpleString: isSimpleString,
    isHashString: isHashString,
    isStoreFileName: isStoreFileName
};
