// CoverView  覆盖物控件
// ---
//
// className:CoverView
// author: Vicent
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// | id | string | true |控件id，|
// | triggers | array | false | 事件触发器|
// | backgroundImage | string | false | 背景图片 |
// | theme | string | false | 样式 |
// | backgroundColor | string | false | 背景颜色 |
// | items | array |  | 子元素 |
//
// ```js
//
// {
//  id: "coverview",
// type: "CoverView",
// backgroundColor: "#ccccc"
// backgroundImage: "url"
// items:[
//     {label: '面板', href: '#dashboard', icon: 'icon icon-home'}
// ]
// triggers: [{
//   target: "testbtn",
//   action: "call",
//   event: "click",
//   method: "btnclick",
//   arguments: {
//     arg1: "arg1",
//     arg2: "arg2"
//   }
// }]
// }
// ```
define(['./BaseView'], function(BaseView){
  // FIXME - 此组件貌似没什么用？去掉，另外样式的实现应该统一从style中来
  return BaseView.extend({

    type: 'CoverView',

    /**
     * backgroundImage: String image url
     * backgroundColor:
     * items: Array of {}
     * theme: String theme name
     */
    configure: function(options) {

      this.$el.css({
        'background-image': 'url(' + options.backgroundImage + ')',
        'background-color': options.backgroundColor || 'white'
        });

      // create menu item
      if (options.items) {
        var fragment = options.items.reduce(_.bind(function(fragment, item){
          fragment.appendChild( this.createItem(item) );
        }, this), document.createDocumentFragment());

        this.$('ul').empty().append(fragment);
      }
    },

    createItem: function(){
      var li = document.createElement('li');
      return li;
    },

    render: function(){
      var menu = document.createElement('ul');
      this.el.appendChild(menu);

      return this;
    },

    setTheme: function(theme){
      // remove old
      if (this.theme) this.$el.removeClass(this.theme);
      // add new
      this.$el.addClass(theme);
      this.theme = theme;

      return this;
    }

  });
});
