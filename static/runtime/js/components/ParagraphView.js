define([
  'underscore',
  './BaseView'
], function(_, BaseView) {

  /*
   * collapse: 是否折叠
   */
   return BaseView.extend({
       // 对应到css
       type: 'ParagraphView',
       events:{
           "click .txt-switch-area":"switchAreaClick",
           "click .text": "onClick",
       },

       _getStyleFromOptions:function(options,innerSpan){
          var styleArr = {};
          // styleArr["display"] = 'inline-block';


          if (this.options.color) {
              styleArr["color"] = this.options.color;
          }

          if (this.options.size) {
              styleArr["fontSize"] = this.options.size;
          }

          if(this.options.padding){
              styleArr["padding"] = this.options.padding;
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

          // 是否限制行数
          if (this.options.isMaxLine) {
            // 最多显示xx行
            if (this.options.maxLine) {
                styleArr["-webkit-line-clamp"] = this.options.maxLine + "";
                styleArr["overflow"] = "hidden";
            }
          }

          if (this.options.collapse) {
              //FIXME 折叠 不显示省略号 没找到解决方法先显示省略号
              styleArr["display"] = "-webkit-box";
              styleArr["-webkit-box-orient"] = "vertical";
          } else {
            // 显示省略号
              styleArr["-webkit-box-orient"] = "vertical";
              styleArr["display"] = "-webkit-box";
          }

          return styleArr;
        },

        switchAreaClick:function(){
            if(this.flag){
                this.switchArea.removeClass("txt-switch-up");
                this.text_el.css("display","-webkit-box");
            }else{
                this.switchArea.addClass("txt-switch-up");
                this.text_el.css("display","block");
            }
            this.flag= !this.flag;
        },

        render: function() {
            this.$el.empty();
            // 文本容器
            this.text_el = $("<div class ='text'></div>");
            this.$el.append(this.text_el);
            this.text_el.css(this._getStyleFromOptions(this.options,this.text_el));
            var text = this.options.text;
            var curModel = this.getModel();

            if(curModel && this.options.key){
                text = curModel.get(this.options.key);
                if (text == undefined) {
                  text = "移动+是用友推出的移动应用开发云平台，通过可视化拖拽的方式就能快速建立移动应用页面";
                }
            }
            text = this.formatData(text);

            if (text){
                //加上toString解决数字调用split报错问题
                var value = text.toString()
                .split('\n')
                .map(function(each) {
                    //只能给span加background属性
                    if(this.options.bgcolor){
                        return"<span style='background:"+this.options.bgcolor+"'>" + each + "</span>";
                    }
                    return "<span>" + each + "</span>";
                }.bind(this))
                .join('');

                this.text_el.append(value);

            }

            if (text && text != "") {
                this.$el.removeClass('empty');
            } else {
                this.$el.addClass('empty');
            }

            if (this.options.dataType == "dynamic"){
                this.$el.removeClass('empty');
            }

            this._delayShowValue();
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
        _delayShowValue: function() {
            var _this = this;
            window.setTimeout(function() {
                var maxheight = $(_this.el).height();
                if (_this.options.collapse ) {
                    // 展开按钮
                    var collapse_el = $("<div class ='txt-icon'></div>");
                    _this.switchArea = $("<div class='txt-switch-area'><span class='icon icon-down-nav' style='font-size:18px;color:#999'></span></div>");
                    if($(_this.el).find('.txt-icon').length==0){
                        collapse_el.append(_this.switchArea);
                        _this.$el.append(collapse_el);
                    }
                }
            }, 50);
        },
        onClick:function(e){
            this.triggerEvent('click');
            if ($(".txt-hide").length>0) {
                this.text_el.css("display","block");
                this.text_el.removeClass("txt-hide");
                // 切换按钮不一定有，需要注意判断空
                this.switchArea && this.switchArea.addClass("txt-switch-up");

            } else {
                this.text_el.css("display","-webkit-box");
                // 切换按钮不一定有，需要注意判断为空
                this.switchArea && this.switchArea.removeClass("txt-switch-up");
            }
        },
        onDataBind: function(model){
            this.render();
        },
    });
});
