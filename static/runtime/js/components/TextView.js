// # TextView

// #author 李文奇

// 文本显示标签

// className: TextView

// ## 配置

// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// collapse | bool | false | 是否折叠
// text | string | false | 显示内容

// 例子：

// ```js
// {
//   type: 'SearchView',
//   options: {
//     collapse:false,
//     text:"text"
//   }
// }
// ```

// ## 样式
define([
  'underscore',
  './BaseView'
], function(_, BaseView) {

  /*
   * collapse: 是否折叠
   */
   return BaseView.extend({
       // 对应到css
       type: 'TextView',
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

            // 最多显示xx行

        styleArr["-webkit-line-clamp"] = "1";
        styleArr["overflow"] = "hidden";


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
                this.text_el.addClass("txt-hide");
            }else{
                this.switchArea.addClass("txt-switch-up");
                this.text_el.removeClass("txt-hide");
            }
            this.flag= !this.flag;
        },
        /*
         * 处理富文本的数据绑定，替换唯一文本节点的数据
         * FIXME 这是个临时解决方案，当数据源数据为富文本时，这种做法就会有问题
         */
        prepareRichTextBind: function(template, text) {
          if (!text) return ''; // 返回空串
          // 判断是否富文本，并且是唯一的文本节点
          var tmp = $('<span>' + template + '</span>');
          var dom = tmp.get(0);
          // 计算文本节点的特定类型节点的个数, 同时返回第一个遇到的文本节点
          var countNode = function(dom) {
            if (!dom) return 0;
            var count = 0;
            var node = null;
            if (dom.childNodes && dom.childNodes.length > 0) {
              for (var i = 0; i < dom.childNodes.length; i++) {
                var currentNode = dom.childNodes[i];
                if (currentNode.nodeType == dom.TEXT_NODE) {
                  count++;
                  // 取得第一个遇到的文本节点
                  if (count == 1) {
                    node = currentNode;
                  }
                } else {
                  // 计算下一个节点
                  var result = countNode(currentNode);
                  count += result.count;
                  if (node == null) {
                    node = result.firstNode;
                  }
                }
              }
            }
            // 返回计算的文本节点数
            return {count: count, firstNode: node};
          };
          var tmp = countNode(dom);
          // 如果文本节点唯一，找到此节点并且替换为绑定的数据
          if (tmp.count == 1 && tmp.firstNode) {
            var txt = tmp.firstNode.data;
            tmp.firstNode.replaceData(0, txt.length, ''); // 清空
            tmp.firstNode.replaceData(0, text.length, text); //新数据
            return dom.innerHTML;
          }
          return text;
        },

        render: function() {
            this.$el.empty();
            // 文本容器 FIXME 默认文本的webkit-box属性在手机端不生效
            this.text_el = $("<div class ='text'></div>");
            // 默认先加上折叠
            this.$el.append(this.text_el);
            this.text_el.css(this._getStyleFromOptions(this.options,this.text_el));
            var text = this.options.text;
            var curModel = this.getModel();

            if(this.$el.css("-webkit-line-clamp")){
                this.text_el.css("-webkit-line-clamp","");
                this.text_el.addClass("txt-hide");
            }

            if(curModel && this.options.key){
                text = curModel.get(this.options.key);
                if (text == undefined) {
                  if (this.currentPage && this.currentPage.$el.hasClass("Designer")) {
                    text = "标签";
                  }
                } else {
                  text = this.prepareRichTextBind(this.options.text, text);
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
            if (this.text_el.hasClass('txt-hide')) {
                this.text_el.removeClass("txt-hide");
                // 切换按钮不一定有，需要注意判断空
                this.switchArea && this.switchArea.addClass("txt-switch-up");

            } else {
                this.text_el.addClass("txt-hide");
                // 切换按钮不一定有，需要注意判断为空
                this.switchArea && this.switchArea.removeClass("txt-switch-up");
            }
        },
        onDataBind: function(model){
            this.render();
        },
    });
});
