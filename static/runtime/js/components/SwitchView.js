// SwitchView  开关按钮
// ---
// #author 陈展鹏
// className:SwitchView
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// ```js
// {
//   type: 'SwitchView',
//   options: {
//   }
// }
// ```
define(['./BaseView'], function(BaseView) {

  return BaseView.extend({

    type: 'SwitchView',
    //触发的函数
    events: {
      //"事件 对象": "函数名"
      "click .switch": "onswitch"
    },
    switch: null,
    inner: null,
    slider_handle: null,
    initialize: function() {
      this.switch = $('<span class="switch"></span>');
      this.inner = $('<span class="switch-inner"></span>');
    },
    render: function() {
      this.$el.empty();
      var curModel = this.getModel();
      var s=curModel && this.options.key ? curModel.get(this.options.key) : this.options.switch;
      if(s==true||s==false){
        this.options.switch=s;
      }
      //开关组件的背景色
      if (this.options.backgroundColor) {
          this.switch.css({
            "background-color": this.options.backgroundColor,
            "border": "1px solid " +  this.options.backgroundColor
          })
      }
      if (this.options.switch) {
        this.switch.addClass('switch-checked');
        if (this.options.backgroundColor) {
            this.switch.css({
              "background-color": this.options.backgroundColor,
              "border": "1px solid " +  this.options.backgroundColor
            })
        }
        this.inner.html(this.options.openText);

      } else {
        this.switch.removeClass('switch-checked');
        //removeClass('switch-checked')后 清除backgroundColor
        this.switch.css({
          "background-color": "",
          "border": ""
        });
        this.inner.html(this.options.closeText);
      }
      this.switch.append(this.inner);
      this.$el.append(this.switch);

      return this;
    },
    getValue: function() {
      return this.options.switch;
    },

    onDataBind: function() {
      this.render();
    },
    onswitch: function(e) {
      // library.ActionSheet([{text: "buttorn",type:"button",callback:function(){}},{text: "label",type:"label"},{text: "red",color:"red",type:"button",callback:function(){}}]);
      e.stopPropagation();

      if (this.options.key) {
        var m = {};
        var CurModel = this.getModel();
        if (CurModel) {
          var checked = CurModel.get(this.options.key);
          this.options.switch = !checked;
          m[this.options.key] = this.options.switch;
          CurModel.set(m);
        }
      } else {
        this.options.switch = !this.options.switch;
        this.render();
      }
    }
  });
});
