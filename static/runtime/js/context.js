define(function(require) {
  var handlebars = require('../../vendor/handlebars/handlebars');
  var _ = require('../../vendor/underscore/underscore');
  var context={}

  context.getConvertContent = function(_this,param) {
    if(!param) return param;
    //如果有参数设置，进行解析
    var isConvert = false;
    $.each(JSON.parse(param),function(key,value){
      var reg =  /\{{(.+?)\}}/;
      if(reg.test(value)){
        isConvert = true;
        return false;
      }
    });
    if(isConvert){
      var currentModel ;
      if(_this.parent.getModel()){
         currentModel=_this.parent.getModel().attributes;
      }
      if(param){
        var totalParam = {};
        if(currentModel){
          totalParam = currentModel;
        }
        var app = window.app;
        var systemKey = window.app.param;
        var paramArray = systemKey.join(",");
        if(paramArray.length >0){
          paramArray = ","+paramArray+",";
        }
        for(var j = 0 ; j < systemKey.length ; j++ ){
          if(systemKey[j].toLowerCase() == "page_id" ){
             console.log(_this.getPage());
             app[systemKey[j]] = _this.getPage().id ;
             break ;
          }
        }
        var system = _.pick(app,function(value, key, object){
           if(paramArray.indexOf(","+key+",")> -1){
             return true ;
           }
        });
        totalParam.system = system;
        var template = handlebars.compile(param);
        param = template(totalParam);
       }
     }
     return param;
  }
  context.getURL = function(url,param) {
    var paramString = "";
    if(param){
      $.each(JSON.parse(param),function(key,value){
        paramString += key +"="+value+"&";
      });
      if(paramString.length>0){
        paramString = "?"+ paramString.substring(0,paramString.length-1);
      }
    }
    if(url){
      url += paramString;
    }
    return url;
  }
  return context;
});
