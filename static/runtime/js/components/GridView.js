// GridView 网格控件
// ---
//
// className:RadioView
// author: pengpanting
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// | rows | int | false |容器的行数 |
// | cols | int | false | 容器的列数 |
// | components | array | false | 容器内的组建 |
// | isBorder | boolean | false | 是否有边框 |
// | borderType | string | false | 边框类型，bold，dashed |
// | borderColor | string | false | 边框颜色 |
// | borderSize | int | false | 边框大小 |
define(['./BaseView'], function(BaseView) {
  // FIXME - 此组件中的样式设置都有问题，不应该把样式写死
  return BaseView.extend({
    type: "GridView",
    isContainer: false,
    // FIXME 底下两个方法啥事没干，为毛要覆盖掉constructor？
    className: function() {
      return this.type;
    },
    // FIXME
    constructor:function () {
      BaseView.apply(this, arguments);
    },
    setGridDomCss: function(dom, json) {
      var range = "";
      var iconWidth = "";
      var fontSize = "";
      var padding = "";
      var marginbottom="";
      if(!this.options.isSeparationLine) {
        switch (this.options.cols) {
          case 3:
            iconWidth = json['type'] == "none" ? "auto" : "50px";
            fontSize = json['type'] == "none" ? "28px" : "24px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "15px";
            break;
          case 4:
            iconWidth = json['type'] == "none" ? "auto" : "44px";
            fontSize =  json['type'] == "none" ? "24px" : "20px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "12px";
            break;
          case 5:
            iconWidth = json['type'] == "none" ? "auto" : "40px";
            fontSize = json['type'] == "none" ? "20px" : "18px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "10px";
            break;
        }
      }else {
        switch (this.options.cols) {
          case 3:
            iconWidth = json['type'] == "none" ? "auto" : "44px";
            fontSize = json['type'] == "none" ? "28px" : "22px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "13px";
            break;
          case 4:
            iconWidth = json['type'] == "none" ? "auto" : "40px";
            fontSize =  json['type'] == "none" ? "24px" :"20px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "10px";
            break;
          case 5:
            iconWidth = json['type'] == "none" ? "auto" : "36px";
            fontSize = json['type'] == "none" ? "20px" : "16px";
            marginbottom='9px';
            range = json['type'] == "radius" ? "50%" : "8px";
            break;
        }
      }
      // FIXME - 写死组件內联样式，外部css根本没有机会覆盖！
      dom.css({
        "color": json['color'],
        "background": json['bgcolor'],
        "border-radius": range,
        "width": iconWidth,
        "height": iconWidth,
        "font-size": fontSize,
        "padding":padding,
        "margin-bottom":marginbottom
      })
      return dom;
    },
    setLridDomCss: function(dom, json) {
      var range = json['type'] == "radius" ? "50%" : "5px";
      dom.css({
        "color": json['color'],
        "background": json['bgcolor'],
        "border-radius": range,
        "width": "28px",
        "height": "28px",
        "font-size": "16px",
        "padding":"4px 4px 4px 4px"
      })
      return dom;
    },
    createGridDom: function(json,isSeparationLine) {
      var wrapper = $("<div class='grid-wrapper'></div>");
      var iconDiv = $("<div class='grid-icon-block'><span class='icon-warp " + json['icon'] + "' aria-hidden='true'></span></div>");
      if(this.options.cols==5){
        var textDiv = $("<div style='color:gray;line-height: 12px;font-size:12px;'>" + json['text'] + "</div>");
      }else{
        var textDiv = $("<div style='color:gray;line-height: 13px;font-size:13px;'>" + json['text'] + "</div>");
      }

      // 当选择无框图标时重写样式
      if (json["type"] == "none" || isSeparationLine) {
        wrapper.attr("style","padding:15px 0");
      }
      var iconDivNew = this.setGridDomCss(iconDiv, json);
      if(json.display=="imageUpload"){ //上传图片
        var url = "url("+json['icon']+")";
        iconDivNew = $("<div class='grid-img-block'>").addClass("grid-icon-img").css({"background-image":url});
      }
      wrapper.append(iconDivNew);
      wrapper.append(textDiv);
      return wrapper;
    },
    layoutGrid: function() {
      var gridWrapper = $("<div class='grid-container'></div>");
      var length = this.options.gridData.length;
      var cols = this.options.cols;
      var isSeparationLine = this.options.isSeparationLine; //是否需要分割线
      var rows = length % cols ? parseInt(length / cols) + 1 : length / cols;
      var width = {
        "width": 100 / cols + "%"
      };
      for (var i = 0; i < rows; i++) {
        var rowtable = $("<div class='grid-row'></div>");
        for (var j = 0; j < cols; j++) {
          var style={};
          // FIXME - 分割线同样不能写死样式！
          if(isSeparationLine){
            style="border-bottom: 1px solid #eee;border-right:1px solid #eee;border-left: 1px solid #eee;border-top: 1px solid #eee;";
            gridWrapper.attr("style","margin:0");
          }else{
            style="";
          }
          if(j!=0){
              style +="border-left:0px;";
          }
          if(i>0) {
            style +="border-top:0px;";
          }
          var index = i * cols + j;
          if (index < length) {
            var colcell = $("<div class='grid-col grid-col-hover' style='"+style+"'></div>");
            colcell.css(width)
            var href = this.options.gridData[index].href || "javascript:";
            if( this.options.gridData[index].linkType=="inapp" && href!="javascript:"){
                href = "#"+href.replace(/.html/,"");
            }
            var a = $("<a href=" + href + "></a>");
            var cdom = this.createGridDom(this.options.gridData[index], isSeparationLine);
            a.append(cdom);
            colcell.append(a);
            rowtable.append(colcell);
          } else {
            var colcell = $("<div class='grid-col'></div>");
            colcell.css(width);
            rowtable.append(colcell);
          }
        };
        gridWrapper.append(rowtable);
      }
      return gridWrapper;
    },
    render: function() {
      this.$el.empty();
      this.options.layout = this.options.layout || this.defaults.layout;
      this.options.gridData = this.options.gridData || this.defaults.gridData;
      this.options.cols = this.options.cols || this.defaults.cols;
      var layout = this.layoutGrid();
      this.$el.append(layout);
      return this;
    }
  });
});
