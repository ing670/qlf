// # SlickView
// ##author pengguangzong
// ## 16-03-25 winkey 重写
// 多张图片通过滑动左右切换
//
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// item  | 数组 | true    | 数组元素：str str是图片路径
// lazyLoad | string | false| 是否按需加载，在触发事件时加载图片，ondemand为延时加载
// 例子：
//
// ```js
// {
//   type: "SlickView",
//   slickOptions: {lazyLoad:"ondemand"},
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
define(['./BaseView', 'slick'], function(BaseView, Slick){

  return BaseView.extend({

    type: 'SlickView',
    slickOptions:{},
    createItem: function(item){
      var carouselItem = document.createElement('div');
      carouselItem.classList.add('image');
      var img = document.createElement('img')
      , key = item.src || this.defaultimage
      , src = key;
      // FIXME 图片路径处理，如果相对站点根目录就加上url地址
      if (key.indexOf("/") == 0 ) {
        src = ((window.app && window.app.url) ? window.app.url : "") + key;
      }

      if (this.slickOptions.lazyLoad == 'ondemand') {
        img.setAttribute('data-lazy', src);
      } else {
        img.src = src;
      }
      var param = context.getConvertContent(this,item.param);
      var paramString = "";
      if(param){
        $.each(JSON.parse(param),function(key,value){
          paramString += key +"="+value+"&";
        });
        if(paramString.length>0){
          paramString = "?"+ paramString.substring(0,paramString.length-1);
        }
      }
      if (item.linkURL) {
         carouselItem.addEventListener('click',function(event){
          window.location.href = item.linkURL + paramString;;
        },false);
      }
      carouselItem.appendChild(img);
      return carouselItem;
    },
    configure: function(options) {
      if (options.key) {
        var curModel = this.getModel();
        curModel && this.setModel(curModel);
      }

      this.slickOptions = _.extend(this.slickOptions, options.slickOptions);
      // 页面显示隐藏时状态维护
      this.stopListening(this.getPage());
      this.listenTo(this.getPage(), "onPause", this.pause.bind(this))
      .listenTo(this.getPage(), "onResume", this.play.bind(this));
    },
    _render: function() {
        this.$el.empty();
        this.isSlick && this.$el.slick("unslick").empty();
        var _htmls = _.map(this.options.items, function(item, index){

          if(typeof item ==  "string"){
            item = {src: item};
          }
          return this.createItem(item);
        }, this);
        this.$el.append(_htmls)
        .slick(this.slickOptions)
        .slick("slickGoTo", 0);
        this.isSlick = true;
        return this;
    },
    render: function() {
      this._render();
    },
    onDataBind: function(){
      if (this.options.key) {
        var curModel = this.getModel();
        this.options.items = curModel ? curModel.get(this.options.key).splice(",") : [];
      };
      this._render();
    },
    pause: function() {
      this.isSlick && this.$el.slick('slickPause');
    },
    play: function() {
      this.isSlick && this.$el.slick('slickPlay');
    }
  });
});
