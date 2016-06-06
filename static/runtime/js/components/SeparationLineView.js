// # SeparationLineView

// #author pengguangzong

// 空白展位DIV

// className: BlankDivView

// ## 配置

// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// height  | string | false | 高度
// background | string | false |  背景颜色


// 例子：

// ```js
// {
//   type: 'SeparationLineView',
//   options: {
//  marginTop:"1",
//  marginRight:"2",
//  marginBottom:"3",
//  marginLeft:"4"
//   }
// }
// ```

// ## 样式
define([
  'underscore',
  './BaseView'
], function(_, BaseView) {


  return BaseView.extend({

    type: 'SeparationLineView',
    // FIXME 样式写到style属性中，避免像下面这样写
    render: function() {
      this.$el.empty();
      var separationLine = $("<div><div>");
      separationLine.css({
        "border-top":"1px solid #eee",
        "margin-top":this.options.marginTop+"px"|| this.defaults.marginTop+"px",
        "margin-right":this.options.marginRight+"px" || this.defaults.marginRight+"px",
        "margin-bottom":this.options.marginBottom+"px" ||this.defaults.marginBottom+"px",
        "margin-left":this.options.marginLeft+"px" || this.defaults.marginLeft+"px",
      });
      this.$el.css({"width":"100%"});
      this.$el.append(separationLine);
      return this;
    },
  });
});
