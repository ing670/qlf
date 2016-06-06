////
//// app运行时启动脚本
////


define(['promise', './libs/fastclick-custom', 'jquery', 'underscore', 'backbone','./Application','../app','./libs/flexiable','./components/loading'], function( P, FastClick, $, _, Backbone, Application,config,flexiable,loading){

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

});
