// SliderView  滑动输入条
// ---
// #author 陈展鹏
// className:SliderView
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// fixed   int   非必须  返回值的小数点保留位置
// min     int    必须    滑动条最小值
// max     int    必须    滑动条最大值
// position string 非必须 定义初始位置
// ```js
// {
//   type: 'SliderView',
//   options: {
//     fixed:0,
//     min:0,
//     max:100,
//     position:10,
//   }
// }
// ```
define(['./BaseView'], function(BaseView) {

  return BaseView.extend({

    type: 'SliderView',
    value: 0,
    events: {
      "touchstart .slider": "onTouchstart",
      "touchmove .slider": "onTouchmove",
      "touchend .slider": "onTouchend",
      "mousedown .slider": "onMousedown",
      "mousemove .slider": "onMousemove",
      "mouseup .slider": "onMouseup",
      "mouseleave .slider": "onMouseleave"
    },
    slider: null,
    rootView:null,
    percentView:null,
    sliderRealWidth:null,
    slider_range: null,
    slider_handle: null,
    minWidth:0,
    // FIXME 写死的內联样式！
    initialize: function(options) {

    },
    position: 0,

    onDataBind: function() {
      this.render();
    },

    render: function() {
      this.$el.empty();
      this.inputLabel = $('<label class="percent-label"  style="display:inline-block;width:100%;"></label>');
      console.log('123');
      // 嵌套过多的层级，写死的样式
      this.rootView = $("<div class='percent-root-view'></div>");
      if(this.options.label && this.options.layout != "noLabel"){
        this.inputLabel.text(this.options.label);
        this.rootView.append(this.inputLabel);
      }
      this.slider = $('<div class="slider"></div>');
      this.slider_range = $('<div class="ui-slider-range" style="width:0%"></div>');
      this.slider.append(this.slider_range);
      this.slider_handle = $('<a class="ui-slider-handle"></a>');
      this.slider.append(this.slider_handle);

      this.percentView = $('<div class="percent-view"></div>');

      var inputDiv = $("<div class='slider-content-view'></div>");
      if(this.options.layout == "horizontal"){
        this.rootView.addClass('label-inline');
        this.minWidth = 72;
        this.rootView.css({"display":"table","width":"100%"});
        this.inputLabel.css({"display":"table-cell","width":"60px","text-align":"left",'vertical-align':'middle'});
        inputDiv.css({"display":"table-cell","text-align":"left",});
      } else if (this.options.layout == "vertical") {
        this.rootView.addClass('label-block');
        this.inputLabel.addClass('form-label-bg');
      } else {
        this.rootView.addClass('label-none');
      }
      inputDiv.append(this.slider);
      inputDiv.append(this.percentView);
      this.rootView.append(inputDiv);
      this.$el.append(this.rootView);

      var curModel = this.getModel();
      var tmpPosition= curModel && this.options.key ? curModel.get(this.options.key) :this.options.position ;
      this.options.position = tmpPosition ? tmpPosition: this.options.position;
      this.value=this.options.position;
      this.position = parseInt(this.options.position) * 0.01;
      this._delayShowValue();
      return this;
    },

    _delayShowValue: function() {
      var _this = this;
      window.setTimeout(function() {
        _this.sliderRealWidth = _this.slider.width();
        _this.tempLeft = _this.position * _this.sliderRealWidth;
        _this.slider_handle.css({
          "transform": "translateX(" + _this.tempLeft + "px)"
        });
        _this.slider_range.css({
          "width": +_this.tempLeft + "px"
        });
        var percent = parseInt(_this.position*100);
        _this.percentView.text(percent+"%");
      }, 50);
    },
    pointLeft: 0,
    tempLeft: 0,
    startX: 0,
    Mouse: false,
    onTouchstart: function(en) {

      if (this.options.noTouch) {
        return;
      }

      en.stopPropagation();

      var touch = en.originalEvent.touches[0];
      var minwidth = this.minWidth;
      this.startX = touch.pageX - minwidth;
      this.pointLeft = this.tempLeft = this.startX ;
      this.assignment();
    },
    onTouchmove: function(en) {
      if (this.options.noTouch) {
        return;
      }
      en.stopPropagation();
      var touch = en.originalEvent.touches[0];
      var diff = touch.pageX - this.startX;
      var minwidth = this.minWidth;
      this.tempLeft = this.pointLeft + diff - minwidth;
      this.assignment();

    },

    onTouchend: function() {
      this.pointLeft = this.tempLeft;
    },

    setValue: function(val) {
      var CurModel = this.getModel();
      if (CurModel) {
        var m = {};
        m[this.options.key] = val;
        CurModel.set(m);
      } else {
        this.options.position = val;
      }
      this.render();

    },
    setNoTouch: function (value) {
      this.options.noTouch = value;
    },
    onMousedown: function(en) {
      if (this.options.noTouch) {
        this.Mouse = false;
      } else {
        this.Mouse = true;
      }
      var touch = en.clientX;//alert(en.clientX);alert(this.slider.width());alert(this.$el.width());
      var minwidth = this.minWidth;
      this.startX = touch - minwidth;
      this.pointLeft = this.tempLeft = this.startX ;
      this.assignment();
    },

    onMousemove: function(en) {
      en.preventDefault();
      if (this.Mouse) {
        var touch = en.clientX;
        var touchy = en.clientY;
        var diff = touch - this.startX;
        var minwidth = this.minWidth;
        this.tempLeft = this.pointLeft + diff - minwidth;
        this.assignment();
      }
    },

    onMouseup: function(en) {
      this.Mouse = false;
      this.pointLeft = this.tempLeft;
    },
    onMouseleave: function(en) {
      this.Mouse = false;
      this.pointLeft = this.tempLeft;
    },
    assignment: function() {
      //控制圆点不超出滑动条范围
      if (0 <= this.tempLeft && this.slider.width() > this.tempLeft) {
        //计算获得刻度，并进行四舍五入
        this.value = (this.tempLeft / this.sliderRealWidth);
        // console.log(this.value);
        this.slider_handle.css({
          "transform": "translateX(" + this.tempLeft + "px)"
        });
        this.slider_range.css({
          "width": +this.tempLeft + "px"
        });
        var percent = parseInt(this.value.toFixed(2)*100);
        this.percentView.text(percent+"%");
      }
    },
    getValue: function() {
      return this.value;
    }
  });
});
