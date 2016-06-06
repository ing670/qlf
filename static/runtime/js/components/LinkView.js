// # LinkView
// #author xurz
// 链接标签
// className: LinkView
// ## 配置
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// text | string | false | 显示内容
// link | string | false |  链接地址
// align | string | false | 显示位置　

// 例子：

// ```
// {
//   : 'LabelView',
//   options: {
//     text:"text"
//     href:""
//     align:""
//   }
// }
// ```

// ## 样式
define([
  'underscore',
  './BaseView'
], function(_, BaseView) {


  return BaseView.extend({

    type: 'LinkView',
    tagName: "div",
    events: {
      "click .line-set": "onClick"
    },
    // FIXME - 去掉在属性中配置样式的代码
    _getStyleFromOptions: function(options, innerDiv) {
      var styleArr = this.options.style;
      if (this.options.color) {
        styleArr["color"] = this.options.color;
      }
      if (this.options.size) {
        styleArr["fontSize"] = this.options.size;
      }
      if (this.options.padding) {
        styleArr["padding"] = this.options.padding;
      }
      if (this.options.lineNum && this.options.lineNum != "") {
        if (this.options.lineNum == 0) return;
        innerDiv.addClass('line-set');
        styleArr["-webkit-line-clamp"] = this.options.lineNum + "";
      }
      if (this.options.lineHeight) {
        styleArr["line-height"] = this.options.lineHeight + "em";
      }
      if (this.options.bold) {
        styleArr["font-weight"] = "bold";
      }
      if (this.options.italic) {
        styleArr["font-style"] = "italic";
      }
      if (this.options.underline) {
        styleArr["text-decoration"] = "underline";
      }
      if (this.options.align) {
        styleArr["text-align"] = this.options.align + "";
      }
      return styleArr;
    },
    render: function() {
      this.$el.empty();
      var innerSpan = $("<a></a>");
      var innerDiv = $("<div></div>");
      var curModel = this.getModel();
      var text = curModel && this.options.key ? curModel.get(this.options.key) : (this.options.text || "");
      innerDiv.html(text);
      var styleArr = {};
      //这里不应该把最外围样式赋予第二层div。
      //innerDiv.css(this._getStyleFromOptions(this.options, innerDiv));
      href = this.options.href;
      var param = context.getConvertContent(this,this.options.param);
      if (!href) {
        href = (this.options.triggers && this.options.triggers.length > 0) ? this.options.triggers[0].href : "";
      }
      if (href) {
        href = context.getURL(href,param);
        innerSpan.attr("href", href);
      }
      innerSpan.append(innerDiv)
      this.$el.append(innerSpan);
      return this;
    },

    onDataBind: function() {
      this.render();
    },

    onClick: function(e) {
      this.triggerEvent("click");
    }
  });
});
