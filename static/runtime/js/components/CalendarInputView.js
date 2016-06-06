// # CalendarInputView
// #author Axiba
// 日历输入组件
// className: CalendarInputView

// ## 配置
// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// title | string | false | 控件文本
// CalendarType | 输入文本类型，包括date, month, week... |
// maxValue | string | false | 最大值
// minValue | string | false | 最小值
// LocalValue | string | false | 当前值

// 例子：
// ```js
// {
//   type: 'CalendarInputView',
//   options: {
//     title:"title"
//   maxValue: "2015-10-16",
//   minValue: "2015-10-01",
//   LocalValue: "2015-10-02",
//   }
// }
// ```

// ## 样式
define(['underscore', './BaseView', '../libs/canlendar'], function(_, BaseView, canlendar){

return BaseView.extend({
    type: 'CalendarInputView',
    input: null,
    events: {
        "click .calendar-content-view": "ClickHandle"
    },

    ClickHandle: function(){
        if(this.canlendarInstance == null){
            var type = "年月日";
            if(this.options.CalendarType == "month"){
                type = "年月";
            }
            var _this = this;
            this.canlendarInstance = new canlendar.Calendar({
                alertWay: this.options.alertWay,
                container: _this.wrapper[0]
            }).bind("ok", function(valStr){
                if(_this.options.key != ""){
                    var m = {},
                        CurModel = _this.getModel();
                    if (CurModel) {
                        m[_this.options.key] = valStr;
                        CurModel.set(m);
                    }else{
                        _this.ClDaInput.val(valStr);
                        _this.valueStr = valStr;
                    }
                }else{
                    _this.ClDaInput.val(valStr);
                    _this.valueStr = valStr;
                }
            }).setModal(type);
        }

        this.canlendarInstance.show(this.valueStr);
    },
    canlendarInstance: null,
    ClDaInput: null,
    contentView : null,

    initialize: function(){

    },

    valueStr: "",

    render: function(){
        this.$el.empty();
        this.ClDaInput = $('<input type="text"/>');
        this.label = $('<label></label>')
        this.wrapper = $('<div class="calendar-input-view"></div>');
        this.contentView = $('<div class="calendar-content-view"></div>');
        var dateIcon = $('<span class="glyphicon"></span>');
        dateIcon.addClass('glyphicon-calendar').addClass('calendar-iput-icon');
        if(this.options.label && this.options.layout != "noLabel"){
            this.label.text(this.options.label);
            this.wrapper.append(this.label);
        }

        this.ClDaInput.attr('name', this.options.key || "");
        this.ClDaInput.attr('placeholder', this.options.placeholder || "");
        this.ClDaInput.attr('type', this.options.textType || "text");
        this.ClDaInput.attr('maxlength', this.options.maxlength);

        if(this.options.layout == "horizontal"){
            this.wrapper.addClass('label-inline');
        }else if(this.options.layout == "vertical"){
            this.wrapper.addClass('label-block');
            this.label.addClass('form-label-bg')
        } else if(this.options.layout == "noLabel") {
            this.wrapper.addClass('label-none');
        }

        if(this.options.alertWay == "INLINE"){
            this.ClickHandle();
            this.ClDaInput.css({"display": "none"});
        }
        this.contentView.append(this.ClDaInput);
        this.contentView.append(dateIcon);
        this.wrapper.append(this.contentView);
        this.$el.append(this.wrapper);

        var curModel = this.getModel();
        this.valueStr = curModel && this.options.key ? curModel.get(this.options.key) : (this.options.LocalValue || "");
        this.ClDaInput.val(this.valueStr);
        if(this.options.alertWay !== "INLINE"){
            this.label.text(this.options.label);
        }
        return this;
    },

    getValue:function(){
        return this.ClDaInput.val();
    },

    setValue:function(value){
        this.ClDaInput.val(value);
    },

    onDataBind: function() {
        this.render();
    },

    remove:function(){
        this.stopListening();
        this.canlendarInstance && this.canlendarInstance.Destory();
    }

});
});
