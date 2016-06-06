// BaseView
// ================
// 所有组件的基类，所有继承它的组件都具有相同的可配置参数，它提供了如下的可配置参数：
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// id | string | false  | 组件id，组件需要响应事件时，必须具备id，在生成的dom中，id也是Dom的id、
// type | string | true | 组件类型，见组件清单
// triggers | array | false | 事件触发器
//
// 事件触发器具备如下的属性：
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// event | string | true | 此触发器需要响应的事件名
// target | string | true | 响应该事件的组件ID
// action | string | true | 响应事件的行为，有script, set, call, navigate, hide, show
// method | string | false | 当action为call时，要调用的方法名
// script | string | false | 当action为script时，eval的javascript代码片段
// arguments | json string | false | 调用方法的参数的json string
// 用于跨组件的事件响应时，只有页面内的响应事件组件的id和此触发器target所指定的id一致时，事件才会被触发
//
// ## 关于组件(View)的生命周期
// 需要明白组件的生命周期，才可在合适的时候覆盖父类的相应函数
//
// 时机 | 切入点函数 | 描述
// -----|-----|-------
// 创建 | initialize | -
// 配置 | configure | - optional
// 加载 | render | － $el has been created now
// 路由 | route | 只有PageView和其子类才有
// 删除 | remove | -
//
define(['underscore', 'backbone', '../libs/querystring', '../view-hierachy'], function(_, Backbone, querystring){

  /*
   * View lifycycles:
   * initialize: 做初始化操作，解析options，监听事件，初始化变量等操作
   * render: 通过模板或DOM API操作this.el进行组件渲染，必须返回this。如果继承别的组件，可能需要调用父类render以保证父类的render逻辑得到执行。
   * onRender: 渲染后的回调，为避免干扰父类原本的渲染逻辑，可以通过覆盖此方法实现二次渲染逻辑
   * onShow: 组件显示
   * onHide: 组件隐藏
   * onRemove: 组件销毁的回调，可以避免直接覆盖remove方法
   */
  _.mixin(require('../libs/underscore-deep-clone'));
  return Backbone.View.extend({

    type: 'BaseView',

    // 默认与type一致
    className: function() {
      return this.type;
    },
    // 默认值
    defaults: {},
    /*
     * 在组件层级中获取当前页面的实例引用
     */
    getPage: function() {
      // 递归向上查找上级组件，判断是否组件
      var findPage = function(component) {
        if (component) {
          // 判断是否PageView, 判断className
          var clsName = _.result(component, 'className');
          if (clsName && clsName.indexOf('PageView') > -1) {
            return component;
          } else {
            if (component.parent) {
              return findPage(component.parent);
            }
          }
        }
        return null; /*no finding*/
      };
      //
      if (!this.currentPage) {
        this.currentPage = findPage(this);
      }
      //
      return this.currentPage;
    },
    /*
     * set model for this Component
     * the parameter can be string, instance of Backbone.Model or Backbone.Collection
     */
    setModel: function(model) {
      if (model == null || model == undefined) return; // reject invalid model
      if (this.getModel()) {
        this.stopListening(this.getModel()); // stop listening to previous model
      }
      if (model instanceof Backbone.Model || model instanceof Backbone.Collection) {
        this.model = model;
      } else if (typeof model == 'string') {
        // load model by name
        var _Model = window.library.getModel(model);
        _Model  = _Model?_Model:window.library.getCollection(model)
        this.model = new _Model;
      } else {
        if (_.isArray(model)) {
          var _Collection;
          if (model.model) {
            _Collection = Backbone.Collection.extend(model, model.model);
            this.model = new _Collection;
          } else {
            this.model = new Backbone.Collection(model);
          }
        } else {
          var _Model = Backbone.Model.extend({
            defaults: model
          });
          this.model = new _Model;
        }
      }
      // trigger an databind event to notify others for databinding mechanism
      this.trigger('databind', this.model);
    },
    // get this model or parent's model
    // TODO allow child view to get a "perspect view" on the a single property
    // this can set the new data bind context for the children
    getModel: function() {
      if (this.model && typeof this.model == 'string') {
        var _Model = window.library.getModel(this.model);
        if (_Model) {
          this.model = new _Model;
        }
      }
      return this.model || (this.parent == null ? null : this.parent.getModel());
    },
    // ask subclass to call this method to implement data bind facilities
    dataBind: function(handler, model) {
      // make sure this initialization executed
      model || (model = this.getModel());
      handler || (handler = this.onDataBind);
      // if no handler or no model, fail fast
      if (!handler || !model) {
        return;
      }
      var keySplitter = /\s+/; // allow space splitted properties
      if (model) {
        //console.log("activate data binding for component:#%s", this.id);
        // if key is provided, just listen to the property
        if (this.options && this.options.key) {
          var _keys = _.result(this.options, 'key'); // key may be a function
          if (!_.isArray(_keys)) {
            if (keySplitter.test(_keys)) {
              _keys = _keys.split(keySplitter);
            } else {
              _keys = [_keys]; // singlular
            }
          }
          for (var i = 0; i < _keys.length; i++) {
            var key = _keys[i];
            if (model.has(key)) {
              this.listenTo(model, 'change:' + key, handler);
            }
          }
        } else {
          this.listenTo(model, 'change', handler);
        }
        // call databind when first bind
        handler.call(this, model);
      }
    },

    // try populate data to the template
    // data is an optional parameter, fallback to Model bind to this component
    evalTemplate: function(template, data) {
      // data, getModel, and fallback to a empty object
      var model = data || this.getModel() || {};
      if (typeof template == 'string') {
        // check if placeholder exists
        var _template = _.template(template);
        // TODO find bind value key and listen to change events
        return _template(model.toJSON ? model.toJSON() : model);
      } else if (_.isFunction(template)) {
        return template(model.toJSON ? model.toJSON() : model);
      }
      /* return the orignal string */
      return template;
    },

    /*
     * override constructor to remember 'options'
     */
    constructor: function(options, parent) {
      this.parent = null, // track the parent

      this.model = null, // bound Backbone.Model or Backbone.Collection
      // remember options
      // 由于defaults可能是嵌套的，而underscore的_.defaults直接赋值
      // 所以有些从defaults中获取的属性都是按照引用获取的，造成同一页面的组件相互影响
      this.options = _.defaults(options || {}, _.deepClone(this.defaults || {}));
      // set parent before call parent constructor

      if (parent && parent instanceof Backbone.View) {
        this.parent = parent;
      }

      // override instance's type with the option
      if (options && options.type && options.type != this.type) {
        this.type = options.type;
      }

      //call super, this will call initialize
      Backbone.View.apply(this, arguments);


    },

    remove: function() {
      Backbone.View.prototype.remove.apply(this, arguments);
      this.stopListening();
      this.onRemove();
    },

    //
    // view lifycycle callbacks
    //
    onRender: function(){},

    onShow: function(){},

    onHide: function(){},

    onRemove: function(){},

    /**
     * modify options, and trigger configure()
     * options是一个对象，但它的属性的值，可以为变量值，也可以是一个函数，以支持动态运算
     * 此特性需要组件自身支持，组件可以通过underscore的result函数同时支持这两种值类型
     */
    setOptions: function(options, override) {
      if (override) {
        this.options = _.defaults(options, this.defaults);
      } else {
        this.options = _.extend(this.options || {}, options);
      }
      // for all the triggers, register the event listener
      this.stopListening(this.getPage()); // stop listening all
      // cancel the preview listening for databind
      this.off("databind");
      // always register an dataBind event to activate event bind
      this.on("databind", function(model){
        this.dataBind(this.onDataBind, model);
      }.bind(this));
      // for all the triggers declaration, register listener to it
      if (this.options.triggers) {
        this.options.triggers.forEach(function(trigger){
          this.listenTo(this.getPage(), trigger.event, this.onEvent.bind(this, trigger));
        }.bind(this));
      }

      // 设置样式，把此函数分离之后有可以在运行时覆盖掉，提供不同手机平台的兼容性支持
      this.setStyle(this.options.style);
      //添加样式支持
      if (this.options.css) {
        this.$el.addClass(this.options.css);
      }
      // 写在此处，免得子类覆盖configure方式时要调用super
      this.configure(this.options);

      return this;
    },
    /*
     * 设置组件外框的内联样式
     */
    setStyle: function(style) {

      if (style) {
        //把外边距包括在width百分比中相应减去
        var width = style['width'] || "";
        var marginLeft = style['margin-left'] || "";
        var marginRight = style['margin-right'] || "";
        if(width.indexOf('%') > 0 && (parseInt(marginLeft.replace('px', '')) > 0 || parseInt(marginRight.replace('px', '')) > 0)) {
          var margin = parseInt(marginLeft.replace('px', '')) + parseInt(marginRight.replace('px', ''));
          var width = style['width'];
          if (width.indexOf('calc') >= 0) {
            width = style['width'].substring(style['width'].indexOf('(')+1,style['width'].indexOf('-') - 1);
          }
          style['width'] = style['min-width'] = style['max-width'] = "calc("+ width +" - "+ margin +"px)";
        }

        if (_.isObject(style)) {
          var styleArr = [];
          _.keys(style).forEach(function(key){
            styleArr.push(key + ":" + style[key] + ";");
          }.bind(this));
          style = styleArr.join("");
        }
        // set style to the element
        this.$el.attr('style', style);
      } else {
        this.$el.removeAttr('style');
      }
    },
    /*
     * replace some existing properties without re-bind event handlers like #setOptions
     */
    replaceOptions: function(options) {
      if (options) {
        var _this = this; // for getting this in callbacks
        _.each(_.keys(options), function(key) {
          if (_.has(_this.options, key)) {
            _this.options[key] = options[key]; // replace the matching property
          }
        });
        // 替换后重新计算样式
        this.setStyle(this.options.style);
        //re configure
        this.configure(this.options);
      }
    },

    /*
     * configure this view by options, trigger by setOptions()
     * subclass should override this method
     */
    configure: function(options) {

    },

    // 事件触发API
    triggerEvent: function(event, options) {
      // a inner function to trim options
      var trimArgs = function(args, _arguments) {
        // passed more then 2 argument, just push them to the args
        if (_arguments.length > 2) {
          for (var i = 1; i < _arguments.length; i++) {
            args[i - 1] = _arguments[i]; // copy arguments
          }
        } else {
          // test the options
          if (_.isArray(options)) { // options is a array
            _.each(options, function(e, i) {
              args[i] = e; // array args passed from app.js may be overwrited, it's un-evitable
            });
          } else if (_.isObject(options)) {
            args = _.extend(args, options); // options is a hash
          } else if (options) {
            args[0] = options; // singluar arguments
          }
        }
        return args;
      }

      var _arguments = _.toArray(arguments); // keep the out function arguments
      var args = trimArgs(args || {}, _arguments);
      // all arguments: static or passed are unified to a {sender: this, arguments:{}} stucture
      // finally, fire event on `PageView Event` bus
      var page = this.getPage();
      page && page.trigger(event, {sender: this, arguments: args});
    },

    getConfig: function() {
      // have to make a copy, FIXME may be have to make a deepClone
      var options = _.clone(this.options);
      if (!options.type) {
        options.type = this.type;
      }
      return options;
    },
    // 触发事件动作
    onEvent: function(trigger, options) {
      var event = trigger.event;
      // only responde to specific component
      if (trigger.target && options.sender
         && trigger.target != options.sender.id) {
        return;
      }
      var sender = options.sender ? options.sender.id : "unknown";
      var action = trigger.action;
      // if no action, auto mapping to onMethod call
      // have to make sure the trigger cann't be the event handler
      // TODO even it is a Single Page Application,
      // make sure only components in the same page can handle the events
      if (!action && event
         && options.sender && options.sender.id != this.id) {
        action = 'call'; // default to method call
        options.method = 'on' + event.substr(0, 1).toUpperCase() + event.substr(1);
      }
      // fail fast
      if (!action) {
        return; // still no action, return directly
      }
      if (action == "script") {
        new Function(trigger.script).apply(this);
      } else if (action == "set") {
        this.setOptions(JSON.parse(trigger.options));
      } else if (action == "call") {
        var method = this[trigger.method];
        if (method) {
          // determine arguments of method
          // all the event handler has the same method signature {sender:xxx, arguments:xxx}
          method.call(this, options.sender, options.arguments);
        }
      } else if (action == "navigate") {
        var href = trigger.href || options.href;
        // append query params
        if (options.arguments) {
          var params = querystring.stringify(options.arguments);
          href = params ? href + ("?" + params) : href;
        }
        if (href && href[0] == "#") {
          Backbone.history.navigate(href, {
            trigger: true
          });
          // window.location.href = options.href.substr(1)+'.html';
          // FIXME 是否要对URI地址进行合法校验
        } else if(href) {
          window.location.href = href;
        }
      } else if (action == "show") {
        this.$el.show();
      } else if (action == "hide") {
        this.$el.hide();
      }
    },
    //FIXME 判断组件是否处于设计器，实现不应该放到baseview
    _getCompositeHandler:function(){
      var handle;
      var target=this;
      while (handle == null && target != null) {
        handle = target.compositeHandler;
        target = target.parent;
      }
      return handle;
    }

  });
});
