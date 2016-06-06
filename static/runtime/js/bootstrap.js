////
//// app运行时启动脚本
////


define(['promise', './libs/fastclick-custom', 'jquery', 'underscore', 'backbone','./Application','../app','./libs/flexiable','./components/loading'], function( P, FastClick, $, _, Backbone, Application,config,flexiable,loading){
  // Promise补丁



  new P(function(resolve,reject){
    //require('../css/base');
    console.log('init');
    flexiable(window);
    //Promise.polyfill();
    window.$=$;
    FastClick.attach(document.body);
    loading.showLoading();
    window.app=config;
    //resolve();
    setTimeout(function(){
      resolve();
    },500);
  }).then(function(resolve,reject){
    console.log("start app");
    window.application = new Application(window.app); // 应用级别共享app数据
    window.application.launch();
    return new P(function(resolve,reject){
      resolve('app started')
    });
  }).then(function(resolve){
    console.log(resolve);
    loading.hideLoading();
  }).catch(function(err){
    console.log(err.stack);
  });
  //console.log(config);
  //loading.showLoading();
  //enable fastclick
  //add loader



  //window.library = library;
  //window.loader = loader;
  //window.context = context;



  // TODO:
  // app定义直接通过模板直接写在html上，保存在window.app变量里
  // 考虑做成独立的requirejs模块，Configuration

  // 加载应用实例

  //window.application.launch();

  // 页面加载完成，去除spinner
  //

});
