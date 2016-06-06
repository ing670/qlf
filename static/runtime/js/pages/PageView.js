define(function() {

  var Backbone = require('backbone');
  var BaseView = require('../components/BaseView');
  var querystring = require('../libs/querystring');
  return BaseView.extend({

    type: 'PageView',
    //
    className: function() {
      return "PageView"
    },
    constructor: function(options) {
        this.params = {}; // hold the parsed parameter from queryString
        var cpns = options.components || [];
        this.components=cpns.map(function(each) {
          return this.createComponent(each);
        }.bind(this));
      // call super
      BaseView.apply(this, arguments);
    },



    remove: function() {
      // cleanup all components
      this.components && this.components.forEach(function(component) {
        component.remove();
      });
      // clean this params
      this.params = {};
      Backbone.View.prototype.remove.call(this);
    },

    render: function() {
      var _this = this;
      // 在组件dom加入本页面dom之前调用,这时可以有一个机会修改component的属性
        this.components.forEach(function(c){
          _this.$el.append(c.render().el);
        });
      return this;
    },
    createComponent: function(cfg) {
      function getTemplate(templateName) {
        return require("../components/"+templateName);
      }
      var Component = getTemplate(cfg.type);
      if (!Component) throw new Error('Component ' + cfg.type + ' Not Exists.');
      // *NOTE* component should not be rendered here, postpone to page render
      var component = new Component(cfg, this);
      component.el.setAttribute('data-type', cfg.type);
      component.setOptions(cfg); // TODO: should be removed ?
      return component;
    },

    addComponent: function(component) {
      if (component instanceof Backbone.View) {
        this.components.push(component);
        this.$el.append(component.el);
      } else {
        this.addComponent(this.createComponent(component));
      }
    },

    insertComponent: function(component, index) {
      if (component instanceof Backbone.View) {

        if (index < this.components.length) {
          // mark anchor component for insertAfter operation before splice
          var anchor_component = this.components[index];
          this.components.splice(index, 0, component);
          component.$el.insertBefore(anchor_component.el);
        } else {
          this.components.splice(index, 0, component);
          component.$el.appendTo(this.el);
        }

      } else {
        this.insertComponent(this.createComponent(component), index);
      }
    },

    removeComponent: function(index) {
      var component = this.components[index];
      this.components.splice(index, 1);
      component.remove();
    },

    findComponent: function(id) {
      var child = _.findWhere(this.components, {
        id: id
      });
      // TODO 这部分代码应该重构到containerView或者更上级中去，让所有容器具备此特性
      if (!child) console.warn('child not found: ' + id);
      return child;
    },
    // for a container, databind happened, pass it to the sub-components
    onDataBind: function(model) {
      // TODO if this page has a template, re-render it
      if (this.components) {
        this.components.forEach(function(c){
          c.trigger("databind", model);
        });
      }
    }
})});
