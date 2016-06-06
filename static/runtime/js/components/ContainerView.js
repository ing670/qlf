define(['require', './BaseView'], function(require, BaseView) {

  var Backbone = require('backbone');
  var _ = require('underscore');

  return BaseView.extend({
    designerCanDragIn:true, // FIXME 组件中不应该包含设计器的逻辑判断
    // 表示组件是否是容器，继承容器的组件此属性都会具备
    isContainer:true,
    type: 'ContainerView',
    // FIXME 处理时应该充分判断style为空的可能，因为可能是程序员写入的json，不应该依赖于初始值
    defaults:{
          style: {}
    },

    // ref: http://benmccormick.org/2015/01/05/marionette-view-life-cycles/
    // initialize is the suggested function for defining behavior on View setup.
    // It's a great place for setting up event listeners, and allows workings directly with the options passed to the View on creation.
    // 解析otions，此处options为页面的定义JSON
    constructor: function(options, parent) {
      this.noHeight = options.noHeight;
      this.components = [];
      if(options.designerCanDragIn!=null){
        this.designerCanDragIn = options.designerCanDragIn;
      }


      BaseView.apply(this, arguments);

      this.components = _.chain(this.options.components || [])
        .map(function(each) {
          if (this.noHeight) {
              each.noHeight = this.noHeight
          }
          var component = this.createComponent(each);
          return component;
        }.bind(this))
        .compact()
        .value();
    },

    getConfig: function(handlers) {
      var options = _.clone(this.options);
      options.components = [];
      var components = this.components || [];
      for(var i = 0, j = components.length; i<j; i++){
        var c = components[i];
        if (c) {
          options.components.push(c.getConfig(handlers));
        }
      }
      return options;
    },

    render: function() {

      this.$el.empty();


      //this.$el.children[0].attr("css":"margin:20px");
      // if(this.$el.parent().attr("data")=="data"){
      //   this.$el.parent().css("margin":this.options.marginLeft+"px");
      // }else{
      //     this.$el.wrap("<div name='data' style=margin:"+this.options.marginLeft+"px></div>");
      // }
      this.inflate(this.options);
    //  this.$el.wrap("<div name='data' style=margin:"+this.options.marginLeft+"px></div>");
      if (this.noHeight != 'yes') {
          this.$el.addClass("baseplateView-layout-wraper");
      }
      // FIXME 在父类中不应该为子类单独写逻辑，此处的实现完全可以通过在字类中覆盖render得到
      if (this.options.type == 'BaseplateView') {
        this.$el.addClass("baseplate-view-height");
      }
      
      if (this.options.style['-webkit-box-orient'] == "horizontal") {
        this.$el.addClass("horizontal");
        this.$el.removeClass("vertical");
      }else {
        this.$el.removeClass("horizontal");
        this.$el.addClass("vertical");
      }
      //容器是否开启flex布局

      return this;
    },
    /*
     * 使用容器中的组件填充整个界面，如果有模版则根据模板布局
     */
    inflate: function(options) {
      if (options.template) {

        var template = window.library.getTemplate(options.template);
        var $template = $(template());

        // 插入组件
        _.chain(this.components)
          .filter(function(each) {
            return !!each.id;
          })
          .each(_.bind(function(each) {
            $template.find('component#' + each.id).replaceWith(each.render().el);
          }, this));

        this.$el.append($template);
      } else {
        // 没有布局，顺序添加到el
        var _this=this;
        this.components.reduce(function($el, component) {
          if (component.type == 'SplitContainerView') {  // FIXME 同上，父类不应该为子类单独考虑判断逻辑
          //  $(component.el).css({height:'100px'});
          }

          var com = component.render();
          return $el.append(_this.designerWraperComponent(com).el);
        }, this.$el);
        if (this.components.length == 0 ) {

          //this.$el.css({minHeight:'100px'})
        }
      }

    },
    // FIXME - 不应该包含设计器中的代码，如果一定需要，
    // 最差的情况，可以考虑在IDE中扩展特定组件的prototype，增加功能
    isInDesign:function(){
      return this._getCompositeHandler()!=null;
    },
    _getCompositeHandler:function(){
      var handle;
      var target=this;
      while (handle==null&&target!=null) {
        handle = target.compositeHandler;
        target = target.parent;
      }
      return handle;
    },
    // FIXME 组件中不应该包含设计器的代码逻辑
    designerWraperComponent:function(component){
      var compositeHandler = component.compositeHandler||this._getCompositeHandler();
      component.compositeHandler =compositeHandler;
      if (component.compositeHandler) {
        component = component.compositeHandler(component)
      }
      return component;
    },

    onRemove: function() {
      // cleanup all components
      this.components && this.components.forEach(function(component) {
        component.remove();
      });

      Backbone.View.prototype.remove.call(this);
    },
    // 这里的参数是组件参数
    createComponent: function(cfg) {
      // 初始化
      var Component = window.library.findClassById(cfg.type);
      if (!Component)
        throw new Error('Component ' + cfg.type + ' Not Exists.');

      var component = new Component(cfg, this);
      // some component may not recognize the extra parent constructor argument
      // ensure the parent has been attached
      this.addChild(component); //put in the view hierachy
      // 配置
      // if (cfg.options) component.setOptions(cfg.options);

      // 尝试剥掉options
      // 从：{type: "ImageView", options: {src: "xxx.png"}}
      // 变成：{type: "ImageView", src: "xxx.png"}
      // 但是要兼容以前的代码，因此做了一个或操作

      component.setOptions(cfg.options || cfg);

      if (cfg.options) {
        console.warn("component config 'options' is deprecated, using {type: 'ImageView', src: 'xxx.png'} directly.");
      }

      return component;
    },

    addComponent: function(component) {
      if (component instanceof Backbone.View) {
        this.components.push(component);
        component.parent = this; // set parent
        this.$el.append(component.el);
      } else {
        this.addComponent(this.createComponent(component));
      }
    },

    find: function(id) {
      var child = _.find(this.components, function(each) {
        return each.id == id;
      });

      if (!child) console.warn('child not found: ' + id);

      return child;
    },

    getValue: function() {
        var json = {};
        _.each(this.components, function(c) {
            if(c.getValue && c.getValue()) {
                json[c.options.key] = c.getValue();
            }
        });
        return json;
    },
    // for a container, databind happened, pass it to the sub-components
    onDataBind: function(model) {
      if (this.components) {
        this.components.forEach(function(c){
          c.trigger("databind", model);
        });
      }
    }
  });
});
