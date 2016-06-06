// # ImageView
// ##author pengpanting
// 显示图片，包括显示图片标题（在图片的左下角），点击图片跳转到到链接
//
// className: ImageView
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// src | string | false | 显示的图片
// title | string | false | 左下角显示的标题
// href | string | false | 点击图片，跳转的链接
//
// 例子：
//
// ```js
// {
//     type: "ImageView",
//     src: "./images/hello.png",
//     title: "terry",
//     href: "http://www.baidu.com"
// }
// ```
////
define(['./BaseView'], function(BaseView) {



  /*
   * 使用div+background-image方式显示图片，以便保持图片比例
   */
  return BaseView.extend({

    // 对应到css
    type: 'ImageView',
    defaultimage: "data:image/png;base64,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",

    initialize: function(options) {
      this.a = document.createElement('a');
      // 图片容器
      // this.div = document.createElement('div');
      this.img = document.createElement('img');
      this.img.classList.add('image');
      this.title = document.createElement('div');
      BaseView.prototype.initialize.apply(this, arguments);
      this.a.style["display"]="block";
      this.img.style["display"]="block";
      if(options.padding){
        this.a.style["padding"]=options.padding;
      }
      // this.div.appendChild(this.img);
    },

    // 使用css显示图片
    // options.src 图片地址
    // options.width 图片实际宽度，用于计算比例
    // options.height 图片实际高度，用于计算比例
    _setImageWithStyle: function(options) {
      var _this = this;
      $(_this.img).attr('src',options.src);
      // $(_this.img).css({
      //   'width': '100%',
      //   'height': '100%'
      // });
      setTimeout(function(){
        var boxWidth = _this.$el.width();
        var boxHeight = 'auto';
        switch (_this.options.scale) {
          case '169' :
            boxHeight = boxWidth * 9 / 16;
            break;
          case '43' :
            boxHeight = boxWidth * 3 / 4;
            break;
          case '11' :
            boxHeight = boxWidth;
            break;
          default:
            boxHeight = 'auto';
        }
        _this.$el.css({'height': boxHeight + 'px'});
        $(_this.img).css({'height':boxHeight +'px'});
      },0);
    },
      _getStyleFromOptions:function(options){
        // var style = {"marginTop":this.options.marginTop+"px","marginRight": this.options.marginRight+"px","marginLeft":this.options.marginLeft+"px","marginBottom":this.options.marginBottom+"px"
        //
        // }
        // options.style = style;
        // }
        // return style;
    },
    render: function() {
      this.$el.empty();
      var param = context.getConvertContent(this,this.options.param);
      var paramString = "";
      if(param){
        $.each(JSON.parse(param),function(key,value){
          paramString += key +"="+value+"&";
        });
        if(paramString.length>0){
          paramString = "?"+ paramString.substring(0,paramString.length-1);
        }
      }
      // 图片连接
      if(this.options.href){
        this.a.href = this.options.href + paramString;
      }
      // 图片标题
      if (this.options.title) {
        this.title.innerText = this.options.title;
        this.title.classList.remove('hide');
      } else {
        this.title.classList.add('hide');
      }
      this.el.appendChild(this.a);
      this.a.appendChild(this.img);
      // $(this.el).css(this._getStyleFromOptions(this.options));
      if (this.options.title) {
        // 文本容器
        this.title.classList.add('title');
        this.title.innerText = this.options.title;
        this.a.appendChild(this.title);
      }
      // FIXME Base64图中就有逗号分割,且此方法逻辑错误
      function repairImagUrl(url){
        if(!url){return url;}
        if (url.indexOf('base64,') > 0) {
          return url;
        }
        //后端返回的可能是一个逗号隔开的字符串
        var Arr = [""];
        if(typeof(url) == "string")
        {
          Arr = url.split(",")
        } else if (url instanceof Array) {
          Arr = url;
        }
        return Arr[0] || "";
      }
      // 使用css显示图片
      var me = this;
      var image = new Image();
      var src;
      // 绑定了数据源的情况
      if (me.options.key) {
        var curModel = this.getModel();
        src = curModel ? curModel.get(me.options.key) : me.defaultimage;
        if (!src) {
          src = me.defaultimage;
        }
        src = repairImagUrl(src);
        // FIXME 图片路径处理，如果相对站点根目录就加上url地址
        if (src.indexOf("/") == 0 ) {
          src = ((window.app && window.app.url) ? window.app.url : "") + src;
        }
        image.src = src;
      } else if (me.options.src) {
        src = image.src = me.options.src;
      } else {
        src = image.src = me.defaultimage;
      }
      image.onload = (function(_me) {
        // _me.img.src = key;
          var imgsrc = src;
          // FIXME 图片路径处理，如果相对站点根目录就加上url地址
          if (src.indexOf("/") == 0 ) {
            imgsrc = ((window.app && window.app.url) ? window.app.url : "") + src;
          }
          _me._setImageWithStyle({
            // 绝对路径，不处理，相对路径，加上window.app.url
            // scale:_me.options.scale,
            src: imgsrc
          });
      })(me);

      image.onerror = (function(_me) {
        return function() {
          _me.img.src = _me.defaultimage;
          // $(_me.img).css({
          //   // 'background-image': 'url(' + _me.defaultimage + ')',
          //   // 'padding-top': 100 + '%'
          // });
        }
      })(me);
      console.log(this.options);
      return this;
    },

    onDataBind: function(model){
      this.render();
    },

  });

});
