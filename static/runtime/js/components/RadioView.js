// RadioView  单选控件
// ---
//
// className:RadioView
// author: pengpanting
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// | display | string | false |单选按钮显示的文字 |
// | name | arr | false | 单选按钮的名字 |
// | value | arr | false | 单选按钮的值 |

define(['./BaseView'], function(BaseView) {

  return BaseView.extend({
    type: "RadioView",
    className: function() {
        return this.type;
    },
    events: {
      "click .radio-button": "radioClick",
    },
    initialize: function() {},
    checkvalue1:null,

    onDataBind: function() {
      this.render();
    },

    render: function() {
      // 嵌套层次太多
      this.rootView = $("<div></div>");
      this.boxView = $("<div></div>");

      this.$el.empty();
      var curModel = this.getModel();
      var items ;

      //var text = curModel && this.options.text ? curModel.get(this.options.text) : this.options.text;
      // this.$el.append($("<label></label>").text(this.options.label));
      var labelDiv = $("<div></div>");
      var label = $("<label></label>");
      // FIXME 不应该像下面这样写死样式
      label.css({"padding-left": "12px"});
      labelDiv.css({"padding":"11px 0"})
      label.text(this.options.label);
      if(this.options.layout == "horizontal"){
        this.$el.addClass("radio-horizon-background");
        labelDiv.addClass("pull-left");
        label.addClass("pull-left");
        this.boxView.addClass("pull-left");
        labelDiv.css({"width":"27%"});
        this.boxView.css({"width":"70%"});
        this.rootView.css({'overflow':'hidden'});
      } else if (this.options.layout == "vertical") {
        labelDiv.addClass('form-label-bg');
      }
      labelDiv.append(label);
      if (this.options.label && this.options.layout != "noLabel") {
          this.rootView.append(labelDiv);
      }

      this.boxView.css({'overflow':'hidden'});
        if(this.options.dataType!="dynamic"){
            items =  this.options.items;
        }else{
            items =  this.options.ditem;
        }
      items = items || this.getItems();
      var group = document.createElement('div');
      var _this = this;
      var r=Math.random()*100;
      $(group).addClass("radio-groupview");
      _.each(items, function(item,index) {
          var div = document.createElement('div');
          div.setAttribute('style',"padding: 10px 0;");
          var radio = document.createElement('div');
          if (_this.options.itemlayout == 'vertical') {
            div.setAttribute('style',"position:relative;display: inline-block;margin-left:1px;padding-top:8px;padding-bottom:8px");
          }
          $(div).addClass("radio-button");
          $(radio).addClass("radio-circle");
          $(radio).addClass("radio-circle"+index);
          this.$(radio).addClass("radio-circle-normal");
          if(item.checked){
            this.$(radio).addClass("radio-circle-checked");
          }
          div.appendChild(radio);
          var span = document.createElement('span');
          span.setAttribute('style','position:relative;top:-5px;margin-right: 27px; color: #91a0ac; font-size: 15px')
          span.innerHTML = item.title;6
          div.appendChild(span);
          group.appendChild(div);
      })
      _this.boxView.append(group);

      this.rootView.append(this.boxView);
      this.$el.append(this.rootView);

      return this;
    },
    setValue: function(val) {
      var CurModel = this.getModel();
      if(CurModel) {
        var m = {};
        m[this.options.key] = val;
        CurModel.set(m);
      }
      else {
        this.checkvalue1 = val;
        this.render();
      }
    },
    getValue: function() {
        var radios = $('[type="radio"]', this.el);
        var tmpval;
        _.each(radios, function(radio) {
            if (radio.checked) {
                //console.log(radio.value);
                tmpval= radio.value;
            }
        });
        return tmpval;
    },
    radioClick: function(e){
      this.$(".radio-circle").removeClass("radio-circle-checked");
      $(e.currentTarget).find(".radio-circle").addClass("radio-circle-checked");
    },
    getItems: function() {
        return (
            [{
              title: '按钮1',
              checked: true,
              key: ''
            },{
              title: '按钮2',
              checked: false,
              key: ''
            },
            ]
        )
    }
  });
});
