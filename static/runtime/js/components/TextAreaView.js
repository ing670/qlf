// TextAreaView
// author Jacky
// options:
// | --- | --- |
// | options | description |
// | textType | 输入文本类型，包括text, number, password, email, date, time, week... |
// | placeholder | 提示文本 |

define(['./BaseView'], function(BaseView){
    //var _this = null;
    // FIXME 写死了样式，写死了defaults，样式应该放入css中，defaults应该放入componentsconfig中
    return BaseView.extend({
        type: 'TextAreaView',
        defaults:{
            label: '内容',
            placeholder: '请输入内容',
            required: true,
            rows: 5,
            maxlength: 1000,
            layout: "vertical",
        },

        inputText: null,
        inputLabel: null,

        initialize: function() {
            //_this = this;
        },

        render: function(){
            this.$el.empty();
            this.inputText = $('<textarea></textarea>');
            this.inputLabel = $('<label></label>');

            var _this = this;
            if(!this.options){
                return;
            }
            var $rootView = $('<div class="textarea-view"></div>');

            if (this.options.label && this.options.layout != "noLabel") {
                this.inputLabel.text(this.options.label);
                $rootView.append(this.inputLabel);
            }

            this.inputText.attr('id', 'textarea-component');
            this.inputText.attr('name', this.options.key || "");
            this.inputText.attr('placeholder', this.options.placeholder);
            this.inputText.addClass('textarea-box');
            this.inputText.attr('rows', this.options.rows || "5");
            if (this.options.maxlength) {
                this.inputText.attr('maxlength', this.options.maxlength);
            }

            if(this.options.layout == "horizontal") {
                $rootView.addClass("label-inline");
            } else if(this.options.layout == "vertical") {
                $rootView.addClass("label-block");
                this.inputLabel.addClass('form-label-bg');
            } else if(this.options.layout == "noLabel") {
                $rootView.addClass("label-none");
            }

            $rootView.append(this.inputText);
            this.$el.append($rootView);


            var curModel = this.getModel();
            var text = curModel && this.options.key ? curModel.get(this.options.key) : this.options.text;


            this.inputText.val(text);
            this.inputText.focus(function(e) {
                _this.inputText.removeClass("input-warning");
                _this.inputText.addClass("input-focus");
            });
            this.inputText.blur(function(e) {
                _this.inputText.removeClass('input-warning');
                _this.inputText.removeClass('input-focus');
            });
            this.setValue(text);
            return this;
        },
        setWarning: function() {
            this.inputText.addClass('input-warning');
            this.inputText.focus();
        },
        getValue:function(){
            return this.inputText.val();
        },
        reSetValue:function (value) {
          this.options.text = value;
          this.render();
        },
        setValue:function(value){
            this.inputText.val(value);
        },

        onDataBind: function() {
            this.render();
        },
    });
});
