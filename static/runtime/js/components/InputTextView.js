// InputTextView
// author Jacky
// options:
// | --- | --- |
// | options | description |
// | textType | 输入文本类型，包括text, number, password, email, date, time, week... |
// | placeholder | 提示文本 |

define(['./BaseView'], function(BaseView){
    //var _this = null;
    return BaseView.extend({
        events: {
          "click .switch": "onswitch"
        },
        type: 'InputTextView',

        inputText: null,
        inputLabel: null,

        initialize: function() {
            //_this = this;

        },

        render: function(){
            this.$el.empty();
            this.inutWrap = $('<div class="input-wrap"></div>');
            this.inputText = $('<input />');
            this.inputLabel = $('<label></label>');

            var _this = this;
            if(!this.options){
                return;
            }
            var $rootView = $('<div class="input-text-view"></div>');

            this.inputText.attr('name', this.options.key || "");
            this.inputText.attr('placeholder', this.options.placeholder || "");
            if (this.options.displaySwitch == "true" && this.options.switch) {
                this.inputText.attr('type', "text");
                this.inputText[0].style.display = "inline";
            } else {
                this.inputText.attr('type', this.options.textType || "text");
            }
            this.inputText.attr('maxlength', this.options.maxlength);

            if(this.options.layout == "horizontal") {// 水平布局的表单
                $rootView.addClass('label-inline');
            } else if (this.options.layout == "vertical") {// 垂直布局的表单
                $rootView.addClass('label-block');
                this.inputLabel.addClass('form-label-bg');
            } else if (this.options.layout == "noLabel") {// 无label的表单
                $rootView.addClass('label-none');
            }
            if (this.options.label && this.options.layout != "noLabel") {
                this.inputLabel.text(this.options.label);
                $rootView.append(this.inputLabel);
            }

            // if(!this.options.label){
            //     // 无label的表单
            //     $rootView.addClass('label-none');
            // }


            this.$el.append($rootView);

            this.inputText.focus(function(e) {
                _this.inputText.removeClass("input-warning");
                _this.inputText.addClass("input-focus");
            });

            this.inputText.blur(function(e) {
                _this.inputText.removeClass('input-warning');
                _this.inputText.removeClass('input-focus');
            });

            var curModel = this.getModel();
            var text = curModel && this.options.key ? curModel.get(this.options.key) : '';
            text = text || this.options.textValue;
            this.setValue(text);

            if (this.options.textType == "password" || this.options.displaySwitch == "true") { //密码框，有开关
                this.inutWrap.append(this.inputText);
                $rootView.append(this.inutWrap);
                this.inutWrap.append(this.getSwitch());
                if (this.options.layout == 'horizontal') {
                    this.inputText.addClass('input-switch-h');
                    this.inutWrap.addClass('input-wrap-h');
                } else {
                    this.inputText.addClass('input-switch-u');
                    this.inutWrap.addClass('input-wrap-u');
                }
                if (this.options.inspectorTextType == 'underline') {
                    this.inutWrap.addClass('underline-p');
                } else {
                    this.inutWrap.addClass('wrap-password');
                }
            } else {
                $rootView.append(this.inputText);
            }
            //输入框的边框
            // if (this.options.inspectorTextType == 'underline' && this.options.textType != "password") {
            //     this.inputText.addClass('underline-text')
            // }
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
          this.options.textValue = value;
          this.render();
        },
        setValue:function(value){
            this.inputText.val(value);
        },

        onDataBind: function() {
            this.render();
        },
        getSwitch: function() {
            this.switch = $('<span class="switch"></span>');
            this.inner = $('<span class="switch-inner"></span>');
            if (this.options.switch) {
              this.inner.css({position:"relative",top:"1px"})
              this.switch.addClass('switch-checked');
              this.inner.html(this.options.openText || "abc");
            } else {
              this.inner.css({fontSize:"27px",position:"relative",top:"-4px",left:'28px',color:'#b4b6b8'})
              this.switch.removeClass('switch-checked');
              this.inner.html(this.options.closeText || "...");
            }
            this.switch.append(this.inner);
            return this.switch;
        },
        onswitch: function(e) {
            this.options.switch = !this.options.switch;
            this.options.textValue = this.getValue();
            if (this.options.switch) {
                this.options.displaySwitch = "true"
            } else {
                this.options.displaySwitch = "false";
            }
            this.render();
        }
    });
});
