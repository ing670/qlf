// # LabelView

// #author xurz

// 文本显示标签

// className: LabelView

// ## 配置

// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// text | string | false | 显示内容
// color | string | false |  字体颜色
// size | string | false | 字体大小　

// 例子：

// ```js
// {
//   type: 'LabelView',
//   options: {
//     text:"text"
//     color:"blue"
//     size:"16px"
//   }
// }
// ```

// ## 样式
define([
  'underscore',
  './BaseView'
], function(_, BaseView) {

  return BaseView.extend({

    type: 'LabelView',
    tagName: "div",
    // FIXME - 默认配置不要放在这
    defaults: {
      text: '',
      color: "",
      size: "",
      lineNum: "",
      lineHeight: "",
      bold: "",
      italic: "",
      underline: "",
      align: "",
      padding: "",
    },
    // FIXME 属性配置应该放styles中，不要在这里拆开处理
    render: function() {
      this.$el.empty();
      var innerSpan = $("<span></span>");
      var curModel = this.getModel();
      var text = curModel && this.options.key ? curModel.get(this.options.key) : (this.options.text || "");
      text = this.formatData(text);
      innerSpan.html(text);
      var styleArr = {};
      if (this.options.displayblock) {
        styleArr["display"] = "block";
      }
      if(this.options.bgstyle){
        innerSpan.attr('style',this.options.bgstyle);
        this.$el.append(innerSpan);
        return this;
      }
      if (this.options.color) {
        styleArr["color"] = this.options.color;
      }
      if (this.options.size) {
        styleArr["fontSize"] = this.options.size;
      }
      if(this.options.padding){
        styleArr["padding"] = this.options.padding;
      }
      if (this.options.lineNum != "") {
        if (this.options.lineNum == 0) return;
        innerSpan.addClass('line-set');
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
        this.$el.css({
          'text-align': this.options.align||"left"
        })
      innerSpan.css(styleArr);
      if(innerSpan[0].localName=="span"){
        innerSpan.addClass('line-set');
      }
      this.$el.append(innerSpan);
      return this;
    },
    formatData: function(data) {
        var reg = /\w{4}[-/]?\w{2}[-/]?\w{2}T\w{2}:\w{2}:\w{2}/;
        var reuslst = reg.test(data);
        if (reuslst) {
            var date = new Date(data);
            return date.format(this.options.format || "yyyy-MM-dd");
        } else {
            return data;
        }
    },
    onDataBind: function() {
      this.render();
    },
    onRemove: function() {
      this.stopListening();
      this.$el.remove();
    }

  });
});
