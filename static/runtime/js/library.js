/*
 * 组件库
 * 此模块是单例对象，Backbone.Collection的实例
 * library的命名灵感源于xcode的xib builder
 */
define(function() {
  //require('./components/ContainerView');
  //require('./components/FragmentView');
  //require('./components/NavView');
  //require('./components/TextView');
  //require('./components/ParagraphView');
  //require('./components/TitleView');
  //require('./components/ImageView');
  //require('./components/VideoView');
  //require('./components/ButtonView');
  //require('./components/CoverView');
  //require('./components/HTMLView');
  //require('./components/CarouselView');
  //require('./components/GalleryView');
  //require('./components/PosterView');
  //require('./components/SegmentedView');
  //require('./components/ListView');
  //require('./components/ListDividerView');
  //require('./components/StaticListView');
  //require('./components/ListItemView');
  //require('./components/ColumnLayoutView');
  //require('./components/LabelView');
  //require('./components/SearchView');
  //require('./components/FormView');
  //require('./components/MenuView');
  //require('./components/AlertView');
  //require('./components/InputTextView');
  //require('./components/SwitchView');
  //require('./components/SliderView');
  //require('./components/RadioView');
  //require('./components/CheckBoxView');
  //require('./components/ColumnLayoutView');
  //require('./components/PanelLayoutView');
  //require('./components/GridView');
  //require('./components/LabelView');
  //require('./components/LinkView');
  //require('./components/IconView');
  //require('./components/PositionContainerView');
  //
  //// new components add here
  //require('./components/ImageUploadView');
  //require('./components/TextAreaView');
  //require('./components/CalendarInputView');
  //require('./components/SplitContainerView');
  //require('./components/GridView');
  //require('./components/PanelView');
  //require('./components/TabLayoutView');
  //require('./components/BlankDivView');
  //require('./components/AtlasView');
  //require('./components/SeparationLineView');
  //require('./components/BaseplateView');

  require('./pages/PageView');
 // require('./pages/TabBarView');
 // require('./pages/NavigationView');
  //require('./pages/PageDetailView');
  //require('./pages/SlidePageView');

  // 模型
  //require('./models/StaticCollection');
  //require('./models/RemoteCollection');
  //require('./models/OpenAPICollection');
  //require('./models/MongoRestCollection');


  // other dependency
  require('./libs/querystring');
  require('./libs/underscore-deep-clone');
  // 引入扩展类库：导入用户自定义资源
  //require('./extension-library');
  // FIXME 禁用扩展功能组件，这部分功能可能需要重新设计实现，有时打不开的造成问题
  //require('./extension-components');





  //NOTE: 创建一个新的变量指向require
  //原因是下面直接写require('./' + id)，运行正常
  //但优化时会误认为('./' + id)是一个依赖性，导致报错
  var _require = require;

  String.prototype.endsWith = function(s) {
    return s === '' || this.slice(-s.length) === s;
  };
  Date.prototype.format= function(fmt) {
    var o = {
      "M+" : this.getMonth()+1,
      "d+" : this.getDate(),
      "h+" : this.getHours(),
      "m+" : this.getMinutes(),
      "s+" : this.getSeconds(),
      "q+" : Math.floor((this.getMonth()+3)/3),
      "S"  : this.getMilliseconds()
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
  };

  return {
    findClassById: function(id) {
      return _require('./components/' + id);
    },

    isExists: function(id) {
      return _require.defined('./components/' + id);
    },

    // 利用text插件读取模板数据，默认是读取字符串
    getTemplate: function(name) {
      var requirePath;
      if (name && name.endsWith(".html")) {
        requirePath = 'text!./templates/' + name;
        var text = require.defined(requirePath) ? _require(requirePath) : null;
        return text ? _.template(text) : null;
      } else if (name && name.endsWith(".mustache")) {
        requirePath = 'hgn!./templates/' + name.replace('.mustache', '');
        return require.defined(requirePath) ? _require(requirePath) : null;
      } else {
        return null;
      }
    },

    getPage: function(name) {
      var requirePath = './pages/' + name;
      return require.defined(requirePath) ? _require(requirePath) : null;
    },

    getComponent: function(name) {
      var requirePath = './components/' + name;
      return require.defined(requirePath) ? _require(requirePath) : null;
    },

    getModel: function(name) {
      var requirePath = './models/' + name;
      return require.defined(requirePath) ? _require(requirePath) : null;
    },

    getCollection: function(name) {
      var requirePath = './models/' + name;
      return require.defined(requirePath) ? _require(requirePath) : null;
    },

    register: function(id, instance) {},
    //
    // 按照运行模式获取真实的服务URL，当且仅当设置了proxy，并且启用时，才对路径进行转换
    // 本地开发服务器会根据proxy的定义自动代理远程服务，避免跨域问题，此时的返回值应为原始URL
    //
    // 在手机上运行时：开启proxy_enable, 此时根据proxy得到真实URL地址
    // 在开发服务器上运行时：关闭proxy_enable，此时获取的路径为相对于站点根目录
    //
    getServiceURL: function(url) {
      if (window.app.proxy && window.app.proxy_enable) {
        // find direct matching
        var val = window.app.proxy[url];
        if (val) {
          return val; // the direct matching
        }
        // find in the route's definition
        for (key in window.app.proxy) {
          if (key.indexOf('*') > 0) {
            var regex = new RegExp(key.replace('*', '(.+)'));
            var path = regex.exec(url);
            if (path) {
              var val = window.app.proxy[key];
              return val.replace('*', path.splice(1));
            }
          }
        }
      }
      //
      return url;
    },
  };
});
