// # CheckboxView

// #author zhangsijing

// 多选框样式

// className: CheckboxView

// ## 配置

// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// title | string | true | 复选框的value
// checkboxcheck | boolean | false |  是否选中
// shape | string | true | 圆框或方框
// line | boolean | false | 是否换行

// 例子：

// ```js
// {
//   type: 'CheckboxView',
//   options: {
//     title :  '历史',
//     checkboxcheck : false,
//     shape : "cir",
//   }
// }
// ```
define(['./BaseView'], function(BaseView) {
  return BaseView.extend({

    type: 'CheckBoxView',

    events: {
      "click .checkbox": "checkClick",
    },

    rootView: null,
    checkList: [],
    boxView: null,

    initialize: function() {

    },

    onDataBind: function() {
      this.render();
    },


    render: function() {
      // FIXME 嵌套层次太多，做一个复选框如此复杂的dom层次结构？
      // FIXME 写死的内联样式不便于外部定制，此组件需要重写
      // FIXME 使用html5的语义，比如label for
      this.rootView = $("<div></div>");
      this.boxView = $("<div></div>");
      this.$el.empty();
      var curModel = this.getModel();
     // var text = curModel && this.options.text ? curModel.get(this.options.text) : this.options.text;
     var labelDiv = $("<div></div>");
     var label = $("<label></label>");
     label.css({"padding-left": "12px"});
     labelDiv.css({"padding": "11px 0"});
     label.text(this.options.label);
     if(this.options.layout == "horizontal"){
       this.$el.addClass("checkbox-horizon-background");
       labelDiv.addClass("pull-left");
       label.addClass("pull-left");
       this.boxView.addClass("pull-left");
       label.css({"margin-top":"5px"});
       labelDiv.css({"width":"27%"});
       this.boxView.css({"width":"70%"});
       this.rootView.css({'overflow':'hidden'});
     } else if(this.options.layout == "vertical"){
       labelDiv.addClass('form-label-bg')
     }
     labelDiv.append(label);
     if (this.options.label && this.options.layout != "noLabel") {
         this.rootView.append(labelDiv);
     }

     this.boxView.addClass("checkbox-boxview");
     this.rootView.append(this.boxView);
      if(this.options.dataType!='dynamic'){
        this.checkList = this.options.items;
      }else{

        this.checkList = this.options.ditem;
      }
      this.createItems(this.checkList || this.getItems());
      return this;
    },

    createItems: function(items){
      var _this = this;
      items.map(function(item,index){
        var view = $("<div style='position:relative;padding-top:10px;padding-bottom:10px'></div>");
        view.addClass('checkbox');
        if(_this.options.itemlayout == "vertical"){
          view.addClass('pull-left');
          view.css({
            "padding-top": "12px",
            "padding-bottom": "8px"
          });
        }
        var checkbox = $('<div ></div>');
        //判断圆框方框
        if (_this.options.shape == 'cir') {
          checkbox.addClass('checkbox-circle');
        } else {
          checkbox.addClass('checkbox-square');
        }
        //判断初始是否选中
        if (item.checked) {
          checkbox.addClass("checkbox-checked");
        }else{
          checkbox.removeClass("checkbox-checked");
        }
        view.attr('alt',index);
        view.append(checkbox);
        var textView = $('<label></label').text(item.title);
        textView.addClass('checkbox-right');
        view.append(textView);
        _this.boxView.append(view);
      })
      this.$el.append(this.rootView);
    },


    getValue: function() {
      var checked = $('.checkbox', this.el);
      var tmpval;
      _.each(checked, function(radio) {
        if ($(radio.children[0]).hasClass('checkbox-checked')) {
          //console.log(radio.value);
          tmpval= $(radio.children[1]).text();
        }
      });
      console.log(tmpval);
      return tmpval;
    },

    //点击触发勾选的显示
    checkClick: function(e) {
      var target = e.currentTarget;
      var index = target.attributes.alt.value;
      this.checkList[index].checked = !this.checkList[index].checked;
      if(this.checkList[index].checked){
        $(target.children[0]).addClass("checkbox-checked");
      }else{
        $(target.children[0]).removeClass("checkbox-checked");
      }
    },
    getItems: function() {
        return  (
            [{
              title: '按钮1',
              checked: false,
              key: '按钮1'
            },{
              title: '按钮2',
              checked: false,
              key: '按钮2'
            },
            ]
        )
    }
  });
});
