// # GalleryView
// ##author pengpanting
// 跑马灯形式显示图片
//
// className: GalleryView
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// items | array，arrya里面包含src属性 | true | 显示的图片数组
//
// 例子：
//
// ```js
// {
//     type: "GalleryView",
//     items: [
//         {
//             src:"/runtime/images/1.png"
//         },
//         {
//             src:"/runtime/images/2.png"
//         }
//     ]
// }
// ```
define([
  'underscore',
  './BaseView',
  'slick'
], function(_, BaseView, Slick){



  return BaseView.extend({

    type: 'GalleryView',

    // 默认值
    defaults: {
      scale:169,
      carousel: 0,
    },

    initialize: function(){
      BaseView.prototype.initialize.call(this, arguments);
      this.numberOfSlicks = 0;
    },

    onRemove: function(){
      this.$('.slick-container').slick('unslick');
    },

    render: function(){

      var slick_el = document.createElement('div');
      slick_el.classList.add('slick-container');
      this.el.appendChild(slick_el);

      // create slick instance
      this.slick = this.$('.slick-container').slick({
        dots: true,
        speed: 1000,
        autoplay: false,
        slidesToShow: 3
      });

      return this;
    },

    _createItem: function(item){
      var carouselItem = document.createElement('div');
      carouselItem.classList.add('image');

      var img = document.createElement('img');
      img.src = item.src;
      carouselItem.appendChild(img);

      return carouselItem;
    },

    configure: function(options) {
      if (options.items) {
        // remove all items
        while(this.numberOfSlicks > 0) {
          this.$('.slick-container').slick('slickRemove', 0);
          this.numberOfSlicks--;
        }

        var me = this;
        setTimeout(function(){
          options.items.forEach(function(item){
            me.$('.slick-container').slick('slickAdd', me._createItem(item));
            me.numberOfSlicks++;
          });
        }, 0);
      }
    }

  });
});
