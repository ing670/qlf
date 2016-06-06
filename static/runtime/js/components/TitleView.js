define([
  'underscore',
  './BaseView',
  './TextView'
], function(_, BaseView, TextView) {

  /*
   * Title text with link
   */
  return BaseView.extend({

    type: 'TitleView',
    events: {
      "click": "clickHandle"
    },
    // FIXME 样式的获取应该通过style属性来做
    _getStyleFromOptions: function(options, innerSpan) {
      var styleArr = {};
      if (this.options.color) {
        styleArr["color"] = this.options.color;
      }
      if (this.options.size) {
        styleArr["fontSize"] = this.options.size;
      }
      if (this.options.lineNum && this.options.lineNum != "") {
        if (this.options.lineNum == 0) return;
        innerSpan.addClass('line-set-titleview');
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
    clickHandle: function(e) {
      this.triggerEvent('click');
    },
    render: function() {
      this.$el.empty();
      // link node
      // keep a reference of inner span
      var theModel = this.getModel();
      var title = this.options.title || '';
      if (theModel && this.options.key) {
        // 引用文本组件的富文本处理方式，这是个临时解决方案 FIXME
        var prepareRichTextBind = TextView.prototype.prepareRichTextBind.bind(this);
        title = prepareRichTextBind(this.options.title, theModel.get(this.options.key));
      }
      var innerSpan = this.innerSpan = $('<span>' + (title) + "</span>");
      innerSpan.css(this._getStyleFromOptions(this.options, innerSpan));
      var style = null;
      if (this.options.titlestyle == "style2") {
        style = ('<span class = "title-shape"></span>')
      }
      if (this.options.titlestyle == "style3") {
        style = ('<span class = "title-circular"></span>')
      }
      if (this.options.titlestyle == "style4") {
        style = ('<span class = "title-hollow"></span>')
      }
      // 增加附加样式
      if (style) {
        this.$el.append(style);
      }
      if (this.options.ellipsis) {
        innerSpan.removeClass("line-set-selected").addClass("line-set-titleview");
      } else {
        innerSpan.removeClass("line-set-titleview").addClass("line-set-selected");
      }
      // 最后加入文本内容
      this.$el.append(innerSpan);
      return this;
    },

    onDataBind: function(model) {
      // 模型变化时替换文本内容
      this.render();
    }
  });
});
