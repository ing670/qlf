// # CarouselView
// ##author pengguangzong
// 继承slickView组件，图片轮播
//
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// item  | 数组 | true    | 数组元素：str str是图片路径
// lazyLoad | string | false| 是否按需加载，在触发事件时加载图片，ondemand为延时加载
// dots | boolean | false | 是否需要轮播图片的小圆点，小圆点可以切换图片
// swipeToSlide| boolean | false |  是否通过平滑的方式
// autoplay | boolean | false | 是否能够自动播放
// speed       | boolean | false |轮播的切换速度，单位为毫秒
// 例子：
//
// ```js
// {
//   type: "CarouselView",
//   slickOptions: {lazyLoad:'ondemand',dots:true,autoplay:true,swipeToSlide: true,speed:1000},
//   items:[
//   {
//     src: "/runtime/images/56.jpg"
//   },
//   {
//     src: "/runtime/images/uu.jpg"
//   }
//  ]
// }
// ```
////
define([
  './SlickView'
], function(SlickView){

  return SlickView.extend({

    type: 'CarouselView',
    slickOptions: {
      lazyLoad: 'ondemand',
      autoplay: true,
      swipeToSlide: true,
      dots: true,
      speed: 300,
      autoplaySpeed: 3000,
      arrows: false,
    },
    initialize: function() {
      this.title_el = $('<div class="carousel-title"></div>').hide();
    },
    _renderEvent: function() {

      this.$el.off('afterChange').on('afterChange',function(event, slick, currentSlide){
        var _currentTitle = this.$el.find(".carousel-title");
        var _v = this.options.items && this.options.items[currentSlide] && this.options.items[currentSlide].description || "";
        _v.trim() == "" ? _currentTitle.hide() : _currentTitle.html(_v).show();
      }.bind(this))

      .off('init').on("init", function(event, slick) {
        var $slides = this.$el.find(".image.slick-slide");
        $slides.each(function(index, slide){
          $img = $(slide).children("img");
          $(slide).css({'background-image': 'url("' + encodeURI($img.attr('src') ||$img.attr('data-lazy')) + '")'});
        });

      }.bind(this));
    },
    render: function() {
      this._renderEvent();
      SlickView.prototype.render.apply(this, arguments);
      this.$el.find(".carousel-title").remove()
      this.$el.append(this.title_el);
      return this;
    }
  });

});
