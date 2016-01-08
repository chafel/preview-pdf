
(function(module){

  if (!module) {
    module = {};

    if('undefined' !== typeof define){
        define(['handlebars'], function(){
            regHelper(require('handlebars'));
        });
    }else{
        throw new Error('no define or modules');
    }
  }else{
    module.exports = regHelper;
  }

function regHelper(Handlebars) { 

  Handlebars.registerHelper('formatTime', function(date, format) {
    date = new Date(date);

    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };

    format = format.replace(/([yMdhmsqS])+/g, function(all, t){
        var v = map[t];
        if(v !== undefined){
            if(all.length > 1){
                v = '0' + v;
                v = v.substr(v.length-2);
            }
            return v;
        }
        else if(t === 'y'){
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
  });

  Handlebars.registerHelper('formatKind', function(kind) {
      var newKind;
      if (kind === 'dailyTash') {
          newKind = '常法';
      }else if (kind === 'project'){
          newKind = '项目';
      }else{
          newKind = '--';
      }

    return newKind;
  });

  Handlebars.registerHelper('formatStatus', function(status) {
      var newStatus;
      if (status==='0') {
          newStatus = '未指派';
      }else if (status==='1'){
          newStatus = '起草中';
      }else if (status==='2'){
          newStatus = 'review中';
      }else if (status==='3'){
          newStatus = '仲裁中';
      }else if (status==='4'){
          newStatus = '待付款';
      }else if (status==='5'){
          newStatus = '已完成';
      }else{
          newStatus = '--';
      }

    return newStatus;
  });

  Handlebars.registerHelper('versionImportance', function(type) {
    var importanceType;
    if (type === 0) {
        importanceType = '主要文件';
    }else {
        importanceType = '次要文件';
    }

    return importanceType;
  });

  Handlebars.registerHelper('getReviewerCode', function(members) {
    //返回参与这个项目所有人的code
    var code = '';
    
    for (var i=0; i<members.length; i++) {
      if (i === members.length) {
        code += members[i].codeName;
      } else {
        code += members[i].codeName + '，';
      }
    }

    if (code === '') {
      code = '暂无';
    }

    return code;
  });

  Handlebars.registerHelper('formatRole', function(members, userId) {
    var roleName;
    members.forEach(function(value){
      if (value['userId'] === userId) {
        roleName = value.role; 
      }
    });

    return roleName;
  });

  Handlebars.registerHelper('formatSpendTime', function(members, userId) {
    var newTotal;
    
    members.forEach(function(value){
      if (value['userId'] === userId) {
        newTotal = value.total;
      }
    });

    if ('undefined' !== typeof newTotal) {
      newTotal = new Handlebars.SafeString(newTotal + 'h&nbsp;&nbsp;<button type="button" id="upload_time_btn" class="btn btn-default btn-xs" data-toggle="modal" data-target="#model">修改耗时</button>');
    } else {
      newTotal = new Handlebars.SafeString('请上传&nbsp;&nbsp;<button type="button" id="upload_time_btn" class="btn btn-default btn-xs" data-toggle="modal" data-target="#model">上传耗时</button>');
    }

    return newTotal;
  });

  Handlebars.registerHelper('formatDescription', function(des, index) {
    var newDes = '草稿';
    
    if (index !== 0) {
      newDes = des
    }

    return newDes;
  });


};


})(typeof module === 'undefined'? null : module);