define(function() {

  var Backbone = require('backbone');
  var _ = require('underscore');
  var BaseView = require('../components/BaseView');
  var querystring = require('../libs/querystring');
  var IScroll = require('iscroll');
  var $=require('jquery');
  return BaseView.extend({

    type: 'PageView',
    //
    className: function() {
      return "PageView"
    },

    // ref: http://benmccormick.org/2015/01/05/marionette-view-life-cycles/
    // initialize is the suggested function for defining behavior on View setup.
    // It's a great place for setting up event listeners, and allows workings directly with the options passed to the View on creation.
    // 解析otions，此处options为页面的定义JSON
    constructor: function(options) {
      this.params = {}, // hold the parsed parameter from queryString
        // convert components option into Backbone Views
        this.components = _.chain(options.components || [])
        .map(function(each) {
          return this.createComponent(each);
        }.bind(this))
        .compact()
        .value();
      // call super
      BaseView.apply(this, arguments);
    },
    // Application可能直接加载页面，所以做个函数在这，维持和TarbarView等的一致性
    // 同时解析传递过来的参数供其他部分使用
    route: function(path, queryString) {
      this.params = queryString ? querystring.parse(queryString) : {};
      // also try to get path parameter, simple path parameter can be get here
      // can never override queryString parameter
      if (path && !_.has(this.params, 'path')) {
        this.params.path = path; // get path parameter
      }
      // 默认的隐藏tabbar的逻辑
      if (this.options.hideNav) {
        Backbone.$('nav.bar').hide();
      } else {
        Backbone.$('nav.bar').show();
      }
      // call post route callback
      this.postRoute();
    },
    // 路由完成之后执行的方法，在这里参数已经获取成功，可以在这里获取参数执行初始化填充动作
    postRoute: function() {

    },
    //
    onResume: function() {
      this.trigger("page:resume");
      setTimeout(function () {
        this.pageScroll && this.pageScroll.refresh();
      }.bind(this), 200)
    },

    onPause: function() {
      this.trigger("page:pause");
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
      // 在组件dom加入本页面dom之前调用,这时可以有一个机会修改component的属性
      this.onBeforeRender && this.onBeforeRender();
      // this.$el.empty();
      var $wrapper = $("<div id='wrapper'></div>");
      var $scroller = $("<div id='scroller'></div>");
      var $box = $("<div class='selectedBox'></div>");
      var $dashedBox = $("<div class='dashedBox'></div>");
      var $del = $("<div class='del glyphicon glyphicon-trash'></div>");
      $box.append($del);
      if (this.$el.find('#wrapper').length < 1) {
        $wrapper.append($scroller);
        this.$el.append($wrapper);
      }
      if (this.$el.find('.selectedBox').length < 1) {
        this.$el.append($box);
      }
      if (this.$el.find('.dashedBox').length < 1) {
        this.$el.append($dashedBox);
      }
      this.header && this.header.remove();
      this.$el.removeClass("page-with-header");
      var $scroller = this.$el.find("#scroller");
      // header
      if (this.options.header) {
        this.$el.addClass("page-with-header");
        this.header = this.getHeaderView(this.options.header);
        this.$el.append(this.header);
      } else {
        this.$el.addClass("page-no-header");
      }
      //判断是否添加padding-bottom样式
      if(!this.options.hideNav && window.app.globalNav){
        this.$el.addClass("page-with-tabbar");
      }
      // 调用检测组件是否开启置顶置底
      // console.log(this.options.components);
      if (this.options.template) {

        loader.getPageTemplate(this.options.template)
          .then(function(template) {
            var $template = $(template());

            // insert components into template
            _.chain(this.components)
              .filter(function(each) {
                return !!each.id;
              })
              .each(_.bind(function(each) { //FIXME if template is not a single node, there is a problem
                $template.find('component#' + each.id).replaceWith(each.render().el);
              }, this));

            $scroller.append($template);
            this._positionFixed(this.options.components);
            this.onRender && this.onRender();
          }.bind(this));

      } else {
        // components
        this.components.reduce(function($el, component) {
          var re = $el.append(component.render().el);
          component.onRender && component.onRender();
          return re;
        }, $scroller);

        this._positionFixed(this.options.components);
        this.onRender && this.onRender();
      }
      var pullUp = this.options.pullUp ;
      var pullDown = this.options.pullDown ;
      if (pullUp || pullDown) {
        setTimeout(function () {
          this.initIScroll(pullUp , pullDown);
        }.bind(this), 100)
      }

      // bind to event handler
      this.setOptions(this.options);
      return this;
    },
  getHeaderView: function(header) {
      var header_el = $('<header class="bar bar-nav"></header>');

      function createNavItem(cfg) {
        var style ={"margin":"0 4px"};
        var icon = "";
        var imageClassName="";
        if(cfg.display=="imageUpload"){
           imageClassName="page-image-upload";
           style = {
             "background-image":"url("+cfg.icon+")"
           };
        }else{
           icon = cfg.icon;
        }
        if (cfg.type == "button" && cfg.text) {
          // 按钮风格，内有文字
          return $('<button class="btn">').text(cfg.text);
        } else if (cfg.type == "link" && !cfg.text) {
          // ios7链接风格，只有图标
          return $('<a></a>').addClass(icon).css(style).addClass(imageClassName);
        } else if (cfg.type == "link") {
          // ios7链接风格，有图标和文字
          var textStyle="";
        if(cfg.display=="imageUpload"){
            imageClassName = "page-image-text";
            style = {"background-image":"url("+cfg.icon+")"};
            textStyle="page-text";
          }
          var item = $('<button class="btn btn-link btn-nav">').css({margin:"0 4px", })
          if (cfg.icon) $('<span></span>').css(style).addClass(imageClassName).addClass(icon).appendTo(item);
          var iconLink =$('<span></span>').addClass(textStyle);
          iconLink.append(cfg.text)
          item.append(iconLink);
          return item;
        }
      }

      if (_.isArray(header.items)) {
        header.items.forEach(function(item, index) {
          // var item_wrapper = $("<div></div>");
          var index_class = 'item-' + index;
          var item_el = createNavItem(item);
          item_el.addClass(index_class).addClass('pull-' + item.pull).appendTo(header_el);
          // item_wrapper.appendTo(header_el);
          this.undelegate('click', '.' + index_class, this.onNavButtonClick.bind(this, item));
          this.delegate('click', '.' + index_class, this.onNavButtonClick.bind(this, item));
        }, this);
      }

      if (header.title) {
        var title = $('<h1 class="title"></h1>').text(header.title);
        header_el.append(title);
      }else{
        header_el.append('<h1 class="title"></h1>');
      }

      return header_el;
    },

    // 导航栏按钮事件响应
    onNavButtonClick: function(cfg) {
      if (cfg.href && cfg.href[0] == '#') {
        Backbone.history.navigate(cfg.href, {
          trigger: true
        });

      } else if (cfg.href) {
        window.location.href = cfg.href;
      } else if (cfg.event) {
        // 特别处理back事件，直接用浏览器的回退
        if (cfg.event == "back") {
          Backbone.history.history
           && Backbone.history.history.back();
         } else {
           this.trigger(cfg.event, cfg);
         }
      }
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
    },

    //初始化上下拉框
    initIScroll: function( pullUp , pullDown ) {
      var iframe = window.frames["editor-device"];
      if (iframe) {
        return;
      }
      var wrapper = this.$el.find("#wrapper");
      var scroller = this.$el.find("#scroller");
      var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
      var bottom = "0px";
      var top = 0;
      if(!this.options.hideNav && window.app.globalNav){ //如果当前页面有导航，滑动的范围减去tabbar部分
        // height  = height - $("nav").height();
        bottom = $("nav").height() + "px";
      }

      if (this.options.header) {
        top = this.$el.find("header").height();
        // 沉浸式效果 给页面拉高相应高度
        if ($("body").hasClass("platform-ios")) {
          top += 20;
        }
      }

      // 沉浸式效果 给页面拉高相应高度
      if ($("body").hasClass("platform-ios")) {
        top += 20;
      }

      wrapper.css({
        "top": top + "px",
        "bottom": bottom,
        "left": 0,
        "width": "100%",
        "overflow": "hidden",
        "position":"absolute"
      });
      var _this = this;
      var pullDownEl, pullDownL;
      var pullUpEl, pullUpL;
      var Downcount = 0,
        Upcount = 0;
      var loadingStep = 0; //加载状态0默认，1显示加载状态，2执行加载数据，只有当为0时才能再次加载，这是防止过快拉动刷新

      //下拉刷新
      pullDownEl = $("<div class='pullTip pullDownTip'><span class='pullDownIcon'></span><span  class='pullDownLabel' >下拉刷新</span></div>");
      pullDownL = pullDownEl.find('.pullDownLabel');
      pullDownEl.hide();

      //上拉加载
      pullUpEl = $("<div class='pullTip pullUpTip'><span class='pullUpIcon'></span><span class='pullUpLabel' >加载更多</span></div>");
      pullUpL = pullUpEl.find('.pullUpLabel');
      pullUpEl.hide();

      scroller.prepend(pullDownEl);
      scroller.append(pullUpEl);

      // var pageend = $("<div class='page-end-tool'></div>");
      // scroller.append(pageend);
      //由于底板被包含在scroller里，transform使position:fixed元素absolute化，
      //在这里将底板有设置position:fixed的remove掉。再append到pageview
      var basep = scroller.find(".BaseplateView");
      for (var i = 0; i < basep.length; i++) {
        if($(basep[i]).css("position") == "fixed") {
          var _baseplateView = basep[i];
          $(basep[i]).remove();
          this.$el.append(_baseplateView);
        }
      }
      // scroller.css({"display":"inline"});
      //实例化IScroll
      _this.pageScroll = new IScroll(wrapper[0], {
        probeType: 3, //probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
        scrollbars: true, //有滚动条
        mouseWheel: true, //允许滑轮滚动
        fadeScrollbars: true, //滚动时显示滚动条，默认影藏，并且是淡出淡入效果
        bounce: true, //边界反弹
        interactiveScrollbars: true, //滚动条可以拖动
        shrinkScrollbars: 'scale', // 当滚动边界之外的滚动条是由少量的收缩。'clip' or 'scale'.
        click: false, // 点击事件
        keyBindings: true, //允许使用按键控制
        momentum: true // 允许有惯性滑动
      });
      _this.pageScroll.on("beforeScrollStart", function() {
      })

      //FIXME 页面高度不够时 页面没有滑动 不会有下拉刷新
      // setTimeout(function () {
      //   this.$el.find(".seatdom").remove();
      //   var seatdom = $("<div class='seatdom'></div>");
      //   var seatdomY = pageend[0].offsetTop;
      //   seatdom.css({
      //     height: height - seatdomY + 10 +"px"
      //   })
      //   scroller.append(seatdom);
      // }.bind(this), 10)

      window.setTimeout(function(){
        _this.pageScroll.refresh();
      },20);

      var createLodingBar = function () {
         var loadingBar = $("<div class='icomoon-load loading-bar'></div>");
         for (var index = 1; index < 13; index++) {
           var path = document.createElement('span');
           path.classList.add('path' + index);
           loadingBar[0].appendChild(path);
         }
         return loadingBar;
      }

      _this.pageScroll.on('scroll', function() {
        $(".pullDownIcon").removeClass("animation");
        if (loadingStep == 0 && !pullDownEl.attr('class').match('flip|loading') && !pullUpEl.attr('class').match('flip|loading')) {
          if (this.y > 0 && this.y < 50) {
            if (pullDown) {
              pullDownEl.show();
              pullDownEl.css({"display":"flex","justify-content":"center"})
              $(".pullDownIcon").addClass("page-start");
              $(".pullDownLabel").addClass("pullDownLabe-start")
              pullDownL.html('<span>下拉刷新</span>');
            }
          } else if (this.y > 50) {
            //下拉刷新效果
            if (pullDown) {
              pullDownEl.show();
              pullDownEl.addClass('flip');
              pullDownL.html('释放刷新');
              $(".pullDownIcon").addClass("page-release");
              // _this.pageScroll.refresh();
              loadingStep = 1;
            }
          } else if (this.y < (this.maxScrollY - 30)) {
            //上拉加载效果
            if (pullUp) {
              pullUpEl.css({"display":"flex","justify-content":"center"})
              $(".pullUpIcon").empty();
              var spinner = $("<div class='spinner icon-ab-loading'>")
              $(".pullUpIcon").append(spinner);
              pullUpEl.show();
              _this.pageScroll.refresh();
              pullUpEl.addClass('flip');
              loadingStep = 1;
            }
          }
        }
      });

      //滚动完毕
      _this.pageScroll.on('scrollEnd', function() {

        if (loadingStep == 1) {
          if (pullUpEl.attr('class').match('flip|loading') && pullUp) {
            pullUpEl.removeClass('flip').addClass('loading');
            loadingStep = 2;
            pullUpAction();
            // _this.pageScroll.refresh();
          } else if (pullDownEl.attr('class').match('flip|loading') && pullDown) {
            pullDownEl.removeClass('flip').addClass('loading');
            pullDownL.html('加载中…');
            loadingStep = 2;
            $(".pullDownIcon").removeClass("page-start");
            var spinner = $("<div class='spinner icon-ab-loading'>")
            $(".pullDownIcon").append(spinner);
            pullDownAction();
            // _this.pageScroll.refresh();

          }
        } else {
          if (pullDown) {
            $(".pullTip").slideUp(400);
          }
        }
      });

      _this.$el.on("mouseleave",function(){
        //_this.pageScroll.scrollEnd();
        //_this.$el.removeEvent(scroller, 'touchend', this);
      });
      //下拉事件
      var pullDownAction = function() {
        setTimeout(function () {
          pullDownEl.removeClass('loading');
          loadingStep = 0;
          $(".pullDownTip").slideUp(400);
          $(".pullDownIcon").removeClass("page-start");
          $(".pullDownIcon").removeClass("page-release");
          $(".pullDownIcon").empty();
          _this.pageScroll.refresh();
          this.trigger("page:pullrefresh");
        }.bind(this), 1000);
      }.bind(this)

      //上拉事件
      var pullUpAction = function() {
        setTimeout(function () {
          loadingStep = 0;
          pullUpEl.removeClass('loading');

          $(".pullUpTip").hide();
          _this.pageScroll.refresh();

          this.trigger("page:pullmore");
        }.bind(this), 200)
      }.bind(this)
    },

    //render时检测子组件是否设置了置顶｜置底
    _positionFixed: function(components) {
      var _this = this;
      setTimeout(function(){
        components && components.forEach(function(e){
          if (e.components != undefined) {
            //递归容器子组件
            _this._positionFixed(e.components);
          }
          if (e.fixedPosition != undefined && e.fixedPosition != "" && e.fixedPosition != "none") {
           var comp = _this.$el.find("#" + e.id);
           if (comp.length > 0) {
           var offsetHeight = comp[0].offsetHeight;
           var _options = _this.options;
           if (!_options.style) {
             _options.style = {};
           }
            if (e.fixedPosition == "top") {
              if (_this.options.header){
                 var oHeight = offsetHeight + 44;
                 _options.style["padding-top"] = oHeight + "px";
                 _this.setOptions(_options);
              } else {
                //_this.setOptions({"style" : "padding-top:" + offsetHeight + "px"});
                _options.style["padding-top"] = offsetHeight + "px";
                _this.setOptions(_options);
                if ($("body").hasClass("platform-ios")) {
                  var $el = $("#" + e.id)
                  , _height = parseInt(e.style["height"])+20;
                  $el.css({"max-height": _height, height: _height});
                }
              }
            }
            else if (e.fixedPosition == "bottom") {
              if (window.app.globalNav && !_this.options.hideNav) {
                var oHeight = offsetHeight + 49;
                _options.style["padding-bottom"] = oHeight + "px";
                _this.setOptions(_options);
              } else {
                _options.style["padding-bottom"] = offsetHeight + "px";
                _this.setOptions(_options);
              }
            }
          }
        }
      });
      // 沉浸式效果 给页面拉高相应高度
      if ($("body").hasClass("platform-ios")) {
        _this.$el.css("padding-top", parseInt(_this.options.style["padding-top"])+20)
      }

     }, 10);
    }
  });
});
