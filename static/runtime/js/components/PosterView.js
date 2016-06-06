// # PosterView
// ##author pengguangzong
// 继承slickView组件，多张图片可上下滑动，自动播放
//
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// item  | 数组 | true    | 数组元素：str str是图片路径
// lazyLoad | string | false| 是否按需加载，在触发事件时加载图片，ondemand为延时加载
// vertical | boolean | false| 是否垂直滑动
// autoplay | boolean | false | 是否能够自动播放
// swipeToSlide| boolean | false |  是否通过平滑的方式
// 例子：
//
// ```js
// {
//   type: "PosterView",
//   slickOptions: {vertical:true,autoplay:true,swipeToSlide: true},
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
define(['./SlickView'], function(SlickView){

  return SlickView.extend({

    type: 'PosterView',

    slickOptions: {
      vertical: true,
      autoplay: true,
      swipeToSlide: true
    }

  });
});
