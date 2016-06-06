// IconView  图标控件
// ---
//
// className:IconView
// author: Johnny
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// | id | string | true |控件id，当按钮配置有事件信息时必须与事件触发器中的target一致 |
// | triggers | array | false | 事件触发器,配置按钮事件在这个对象里 |
// | positionWidth | int | false | 图标大小 |
// | iconItem | string | false | 图标或图片信息 |
//
// ```
define(['./BaseView'], function(BaseView){
  return BaseView.extend({
    type: 'IconView',
    events: {
      "click": "onClick"
    },
    render: function() {
      this.$el.empty();
      if(this.options.iconItem.display=="imageUpload"){
        this.$el.removeAttr('class');
        this.$el.addClass("IconView grid-icon-img");
      }else {
        this.$el.removeAttr('class');
        this.$el.addClass("IconView "+ this.options.iconItem.icon);
      }
      return this;
    },

    onClick: function(e) {
      var param = context.getConvertContent(this,this.options.param);
      console.log(param);
      this.triggerEvent("click",param);
    }
  })
})
