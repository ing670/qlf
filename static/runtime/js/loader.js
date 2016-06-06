define(function(require){

  //NOTE: 创建一个新的变量指向require
  //原因是下面直接写require('./' + id)，运行正常
  //但优化时会误认为('./' + id)是一个依赖性，导致报错
  var _require = require;
  var _ =_require('underscore');

  // wrap require api into promise
  var requirePromise = function(path){
    return new Promise(function(resolve, reject){
      _require(path, resolve, reject);
    });
  }

  // AMD Promise API
  return {
    getTemplate: function(name){
      var requirePath;
      if (name && name.endsWith(".html")) {
        // underscore template
        requirePath = 'text!./templates/' + name;

        return requirePromise([requirePath])
        .then(function(text){
          return _.template(text);
        });
      } else if (name && name.endsWith(".mustache")) {
        // mustache template
        requirePath = 'hgn!./templates/' + name.replace('.mustache', '');

        return requirePromise([requirePath]);
      }
    },
    get: function(type, name){
      var path = './' + type + 's/' + name;
      return requirePromise([path]);
    },
    getComponent: function(name){
      return this.get('component', name);
    },
    getModel: function(name){
      return this.get('model', name);
    },
    // 取得页面的配置信息
    getPageConfig: function(name) {
      var config='./pages/' + name + '.json';
      return require(config);
    },

    // async API for page loading
    // Login.json, Login.js, Login.css, Login.html
    createPage: function(name){
      // 允许接收一个完整的页面配置JSON对象来创建页面

      // 如果是字符串名称，则调用其它函数获取页面配置
      if (_.isString(name)) {
        name = this.getPageConfig(name);
      }
      var promise = new Promise(function(resolve, reject){
        resolve(name);
      });
      return promise.then(function(config){
        // 使用配置创建页面实例
        var requires = _.compact([
          './pages/' + (config.type || 'PageView'),
          config.template ? 'text!./pages/' + config.template : null,
          config.css ? 'css!./pages/' + config.css : null
        ])
        var PageClass=require(requires);
        return new PageClass(config)
      });
    },
    createRootPage: function(name){
      // FIXME 临时给page加上NavigationView
      var c ='./pages/' + name + ".json";

      var config=_require(c);
      console.log(config);
      if (config.type != 'TabBarView' && config.type != 'NavigationView') {
        animate = config.animate;
        config = {};
        config.type = 'NavigationView';
        config.rootPage = name;
        config.animate = animate;
      }

      var page='./pages/' + (config.type || 'PageView');
      var PageClass=_require(page);
      console.log(PageClass);
      return new Promise(function(resolve){
          resolve(new PageClass(config));
        });
//      return new Promise(function(resolve){
//        resolve(config) ;
//      }).then(function(config){
//        if (config.type != 'TabBarView' && config.type != 'NavigationView') {
//          animate = config.animate;
//          config = {};
//          config.type = 'NavigationView';
//          config.rootPage = name;
//          config.animate = animate;
//        }
////去除了template特性
//        var page='./pages/' + (config.type || 'PageView');
//        var requires = _.compact([
//          './pages/' + (config.type || 'PageView')
//          //config.template ? 'text!./pages/' + config.template : null,
//          //config.css ? 'css!./pages/' + config.css : null
//        ])
//        var PageClass=_require(page);
//        return new Promise(function(resovle){
//            resovle(PageClass);
//        })
//        .then(function(PageClass){
//          return
//        })
//        .catch(function(err){
//          console.error(err);
//        });
//      });
    },

    /**
     * load underscore template from 'pages/' folder
     * @param  {[type]} name template name
     * @return {Promise}     require promise
     */
    getPageTemplate: function(name){
      requirePath = 'text!./pages/' + name;

      return requirePromise([requirePath])
      .then(function(text){
        return _.template(text);
      })
      .catch(function(err){
        console.log(err);
      });
    },

    /**
     * detect the resource represent by the path in this application exists
     *
     * using 'application index' in lazy mode
     * using 'require.defined' in full-loaded mode by 'extension-library'
     *
     * @param  {String} path resource path, AMD or CMD
     * @return {Boolean}      true | false
     */
    has: function(path){
      return require.defined(path);
    },

    hasPage: function(name) {
      var page='./pages/' + name + '.json';
      return this.has(page);
    }
  }
});
