define(function(require) {

  var Backbone = require('backbone');
  var _ = require('underscore');
  var PageView = require('./PageView');

  return PageView.extend({

    type: 'SlidePageView',

    className: function() { return "PageView SlidePageView"},

    render: function(){
      PageView.prototype.render.apply(this, arguments);
      var transition_options = this.options.transition;

      var config = this.getStretchConfig(transition_options&& transition_options.stretch);

      if(transition_options && ( transition_options.type == "rightOut" || transition_options.type == "leftOut")){
        this.$el.css({width:config.width});
      } else {
        this.$el.css({height:config.height,minHeight: "initial"});
      }
      // 首先以隐藏的情况出现，然后再整体滑出
      this.$el.hide();
      return this;
    },
    /**
     * 对于滑出页的逻辑应该单独处理，此时在渲染完成之后会给予上一个页面，完成过渡
     * @param {relatePage} - 当{direction}为in时，那么是relatePage是上一页，
     * 如果是out时，那么是下一页
     * @param {direction} - in/out - 固定的值，表示转场效果是进入或者退出
     * in（进入）表示路由导航从其他页进入到此页；out(退出)表示路由导航从此页离开去往其他页
     */
    transit: function(relatePage, direction) {
      if (direction === 'in' || direction === true) {
        this.pageSlideIn(relatePage, this.options.transition);
      } else if (direction === 'out' || direction === false) {
        this.pageSlideOut(relatePage, this.options.transition);
        // 由于需要几个页面交叉叠加，所以某些资源需要延迟到此时才处理
        this.clean && this.clean();
      } else {
        console.warn("not supported direction:" + direction);
      }
    },
    // 处理滑入页的过渡效果
    pageSlideIn: function(normalPage, transitionConfig){
      var transitionType = this.transitionFactory(transitionConfig.type),
      duration = transitionConfig.duration;
      //stretch转成px
      var config = this.getStretchConfig(transitionConfig.stretch);

      this.$el.css({ "transition":"none","-webkit-transition":"none","transform": transitionType.slideInitTransform(config) });
      this.$el.show(); //此时再显示滑出
      window.setTimeout(function(){
        this.$el.css({ "transition":"all "+duration+" ease","-webkit-transition":"all " + duration + " ease","transform": transitionType.slideEndTransform(config) });
        if(transitionConfig.type == "leftOut" || transitionConfig.type == "rightOut"){
          var normalPage_transform = transitionType.nomalPageEndTransform(config);
          //winkey 直接滑出时 normalPage 不存在（预览）
          normalPage && normalPage.$el.css({ "transition":"all " + duration + " ease","-webkit-transition":"all " + duration + " ease","transform": normalPage_transform });
          Backbone.$('nav.bar').css({ "transition":"all "+duration+" ease","-webkit-transition":"all " + duration + " ease","transform": normalPage_transform });
        }
      }.bind(this), 5);
      this.$el.css({"zIndex":"11"});
      // 可能预览直接滑出，没有被推走的页
      //创建遮罩层, 并且留存一个引用
      var sliderBackCover = $("<div class='slide-backover'></div>");
      this.sliderBackCover = sliderBackCover;
      if (normalPage) {
        normalPage.$el.append(sliderBackCover);
        sliderBackCover.bind("click",function(){
            window.history.go(-1);
        });
      } else {
        // 直接预览时，给body加个遮罩
        this.$el.parent().append(sliderBackCover);
      }
    },
    // 处理滑出页过渡效果
    pageSlideOut: function(normalPage, transitionConfig){
      var transitionType = this.transitionFactory(transitionConfig.type);
      var duration = transitionConfig.duration;
      // 给滑出页动画结束加上事件
      normalPage.$el.bind("transitionend webkitTransitionEnd", function() {
        this.remove();
      }.bind(this));
      if(transitionConfig.type == "leftOut" || transitionConfig.type == "rightOut"){
        normalPage.$el.css({ "transition":"all " + duration + " ease", "-webkit-transition":"all " + duration + " ease", "transform":"translate3d(0,0,0)" });
        Backbone.$('nav.bar').css({ "transition":"all " + duration + " ease","-webkit-transition":"all " + duration + " ease", "transform":"translate3d(0,0,0)" });
      }
      // 滑动走了之后，无论如何都要移除掉backcover
      this.sliderBackCover.remove();
      this.$el.css({ "transition":"all " + duration + " ease", "-webkit-transition":"all " + duration + " ease", "transform": transitionType.slideInitTransform(window.innerWidth)});
    },
    /**
     * 上左下右各个滑出方向对应的样式产生器
     */
    transitionFactory: function(type) {
      switch (type) {
        default :
        case "leftOut" :
      return {
        "slideInitTransform": function(config){
          return "translate3d(-" +config.width + "px,0,0)";
        },
        "slideEndTransform": function(){
          return "translate3d(0,0,0)";
        },
        "nomalPageEndTransform":function(config){
          return "translate3d(" + config.width + "px,0,0)";
        }
      };
      case "rightOut" :
      return {
        "slideInitTransform": function(config){
          return "translate3d(" + config.width + "px,0,0)";
        },
        "slideEndTransform": function(config){
          var _width = window.innerWidth - config.width;
          return "translate3d(" + _width + "px,0,0)";
        },
        "nomalPageEndTransform": function(config){
          var _width = config.width - window.innerWidth;
          return "translate3d(" + _width + "px,0,0)";
        }
      };
      case "bottomOut" :
      return {
        "slideInitTransform": function(config){
          // this.$el.css({height:config.height,minHeight: "initial"});
          return "translate3d(0," + window.innerHeight + "px,0)";
        },
        "slideEndTransform": function(config){
          var _height =  window.innerHeight - config.height;
          return "translate3d(0," + _height + "px,0)";
        }
      };
      case "topOut":
      return {
        "slideInitTransform": function(config){
          // this.$el.css({height:config.height,minHeight: "initial"});
          return "translate3d(0,-100%,0)";
        },
        "slideEndTransform": function(config){
          return "translate3d(0,0,0)";
        }
      };
    }
  },
  getStretchConfig: function (stretchconfig){
    var config = { width: "100", height: "100" }
    , stretchconfig = stretchconfig || "50%"
    , stretchconfig_int = parseInt(stretchconfig);
    if (isNaN(parseInt(stretchconfig_int)) || stretchconfig_int < 1) {
        transitionConfig.stretch = "50%";
        stretchconfig_int = 50;
    }

    if (/%$/.test(stretchconfig)) {
      config.width = window.innerWidth * stretchconfig_int / 100;
      config.height = window.innerHeight * stretchconfig_int / 100;
    } else {
      config.width = stretchconfig_int;
      config.height =  stretchconfig_int;
    }
    return config;
  }
  });
});
