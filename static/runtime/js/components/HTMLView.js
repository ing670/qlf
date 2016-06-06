// # HTMLView
//
// HTML组件，用于在page中嵌入html
//
// ## 配置
//
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
//    html | string | false | 需要嵌入的html代码
//    src | string | false | 外部添加内容
//    flag | string | false | 判断加载html还是src的内容，默认加载html内容
//
// 例子：
//
//
// ```js
// {"type":"HTMLView","html":"Hello World!!!"}
// ```
// ## 事件
//
// ### 此组件监听的事件
// 事件 | 描述
// ----|------
// |
//
// ### 此组件发出的事件
// 事件 | 描述
// ----|-----
// |
define([
  'underscore',
  './BaseView'
], function(_, BaseView){

  return BaseView.extend({

    // 对应到css
    type: 'HTMLView',

    onDataBind: function(model) {
      // only retrieve the key property
      if (_.has(model, this.options.key)) {
        this.$el.empty();
        this.$el.append(model[this.options.key]);
      } else {
        this.render(); // only re-render
      }
    },

    render: function(){
      this.$el.empty();

      if (this.options.flag == 'src' && this.options.src) {
        //  this.$el.load(model && this.options.key ? model(this.options.key) : this.options.src);
        var tsrc = (model && this.options.key) ? model(this.options.key) : this.options.src;
        var source;
        $.ajax({
            url: tsrc,
            type: 'GET',
            timeout: 5000,
            async:false,
            success:function(data){
              source = data;
            },
        });
        this.$el.text(source);

      }  else {
          if(this.options.html){
            var model = this.getModel();
            var html = this.options.html;
            if(model){
              // todo 临时用模板处理
              var content = this.evalTemplate(html);
              this.$el.append(content);
            }else{
              this.$el.append(html);
            }
          }
      }
      return this;
    },

  });
});
