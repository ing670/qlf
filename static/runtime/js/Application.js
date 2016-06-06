define(function() {
  var _ = require('underscore');
  var Backbone = require('backbone');
  var PageView = require('./pages/PageView');
  var $ = require('jquery');
  //
  // app: app model (from app.js)
  var Application = function(model, options) {
    this.model = model;
    this.options = options;
    this.initialize.apply(this, arguments);
  };

  _.extend(Application.prototype, Backbone.Events, {

    initialize: function() {
      this.pages=[];
      this.pagesClass=[];
      this.currentPage;
      var _this = this;
      var req = require.context("./pages", true, /^(.*\.(json$))[^.]*$/igm);

      req.keys().forEach(function(key){
        console.log(key);
        _this.pages.push(req(key));
      });

    },

    launch: function() {

      console.log(this.pages);
      this._initCollections();
      //var entryPage = this.getPageId().split('#');
       this.pageContainer = $('<div class="page-group"></div>');
      var p=this.createPage(window.app.defaultPage);
      this.pagesClass.push(p);
      this.currentPage=p;
      this.pageContainer.appendTo(window.document.body);
      this._initRouter();
    },
    createPage: function(name){
      var c ='./pages/' + name + ".json";
      var config=require(c);
      var PageClass=require("./pages/"+config.type);
      var p=new PageClass(config);
      p.render().$el.appendTo(this.pageContainer);
      return p;

    },
    _initRouter: function() {
      var Router = Backbone.Router.extend({
        routes: {
          "*path(?*queryString)": "any"
        }
      });
      var router = new Router();
      this.listenTo(router, 'route:any', this.route);
      // launch history
      var pathname = window.location.pathname;
      var rootPath = Backbone.history.decodeFragment(pathname); //.substr(0, pathname.lastIndexOf('/'));
      Backbone.history.start({
        pushState: false,
        root: rootPath
      });

      console.log("start history with root: [%s]", rootPath);
    },
    hasPage:function(path){
      return this.pages.find(function(page,index){
        return page.id==path;
      });

    },
    _animateElement : function($from, $to, direction) {
    // todo: 可考虑如果入参不指定，那么尝试读取 $to 的属性，再没有再使用默认的
    // 考虑读取点击的链接上指定的方向
    if (typeof direction === 'undefined') {
      direction = "rightToLeft";
    }

    var animPageClasses = [
      'page-from-center-to-left',
      'page-from-center-to-right',
      'page-from-right-to-center',
      'page-from-left-to-center'].join(' ');

    var classForFrom, classForTo;
    switch(direction) {
      case "rightToLeft":
        classForFrom = 'page-from-center-to-left';
        classForTo = 'page-from-right-to-center';
        break;
      case "leftToRight":
        classForFrom = 'page-from-center-to-right';
        classForTo = 'page-from-left-to-center';
        break;
      default:
        classForFrom = 'page-from-center-to-left';
        classForTo = 'page-from-right-to-center';
        break;
    }

    $from.removeClass(animPageClasses).addClass(classForFrom);
    $to.removeClass(animPageClasses).addClass(classForTo);
      $from.on("webkitAnimationEnd",function(){
        $from.removeClass(animPageClasses);
      });
      $to.on("webkitAnimationEnd",function(){
        $to.removeClass(animPageClasses);
        $from.css({display:'none'});
      });
    //$from.animationEnd(function() {
    //  $from.removeClass(animPageClasses);
    //});
    //$to.animationEnd(function() {
    //  $to.removeClass(animPageClasses);
    //});
  },
    route: function(path, queryString) {
      path&&(path=_.last(path.split('/')));
      !path&&this.currentPage._parent&&(path=this.currentPage._parent.id);
      console.log(path);
      if((path&&this.hasPage(path))){
        var lastPage=this.pagesClass[this.pagesClass.length-1];
        if(lastPage._parent&&path==lastPage._parent.id){
          //返回
          this._animateElement(this.currentPage.$el,lastPage._parent.$el,'leftToRight');
          this.currentPage=lastPage._parent;
          lastPage.remove();
          this.currentPage.$el.css({'display':'block'});
          lastPage._parent=null;
          this.pagesClass.pop();
        }else{
          //新页面
          var nPage=this.createPage(path);
          this._animateElement(this.currentPage.$el,nPage.$el,'rightToLeft');
          nPage._parent=this.currentPage;
          this.pagesClass.push(nPage);
          this.currentPage=nPage;

        }
      }
    },

    // FIXME cann't make sure custom collection has been loaded yet
    _initCollections: function() {
      var collections = window.app.collections;
      for (var key in collections) {
        _Collection = require('./models/' + collections[key].type);
        if (_Collection) {
          this.collectionPool[key] = new _Collection(null, collections[key]);
        }
      }
    },

    collectionPool: {},

    //getCollection: function(name, models) {
    //  var collection = this.collectionPool[name];
    //  if (!collection) {
    //    var _Collection = library.getCollection(name);
    //    if (_Collection) {
    //      collection = this.collectionPool[name] = new _Collection;
    //    }
    //  }
    //  if (models)
    //    collection.models = models;
    //  return collection;
    //},

  });


  Application.extend = Backbone.Model.extend;
  return Application;
});