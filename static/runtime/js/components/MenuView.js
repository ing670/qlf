// menuView 菜单组件
// ---
//
// className:menuView
// author: pengguangzong
//

define(['./BaseView'], function(BaseView) {

    return BaseView.extend({
        type: "MenuView",
        isContainer: false,

        className: function() {
            return this.type;
        },
        createListDom: function(json) {
            var hasArrow = this.options.hasArrow,
                hasIcon = this.options.hasIcon,
                arrowStyle = "",
                hasIconStyle = "",
                menuIconNew = "",
                href = json['href'],
                range = json['type'] == "radius" ? "50%" : "8px";

            if( json.linkType == "inapp" && href != "javascript:"){
                href = "#"+href.replace(/.html/,"");
            }
            if(!json['subtitle']){
                json['subtitle'] = "";
            }
            if(json.display=="imageUpload"){ //上传图片
                var url = "url(" + json['icon'] + ")";
                menuIconNew = $('<div class="menu-img-block grid-icon-img" style="background-image:' + url + '"></div>');
            }else{
                menuIconNew = $('<div class="list-icon-block menu-icon" ><span class="' + json['icon'] + '"></span></div>');
                menuIconNew.css({"border-radius": range});
                menuIconNew.css({"color": json['color']});
                if (json['bgcolor'] != '') {
                    menuIconNew.css({"background-color": json['bgcolor']});
                }
                if(json['type'] == "none"){
                  menuIconNew.css({
                    "background": "none",
                    "font-size": "17px"
                });
                }
            }
           var tip =  json['tip'] || "";
            var menuDom = [
                    '<a class="grid-row menu-row" href="' + href+ '">',
                        '<div class="grid-col menu-icon-warp">',
                        '</div>',
                        '<div class="grid-col menu-text">',
                            json['text'] + '<span class="menu-subtitle">' + json['subtitle'] + '</span>',
                        '</div>',
                        '<div class="grid-col menu-tip">',
                            '<span class="">' + tip + '</span>',
                        '</div>',
                        '<div class="grid-col menu-arrow" style="color:' + json['footColor'] + '">',
                            '<span class="' + json['footIcon'] + '"></span>',
                        '</div>',
                    '</a>'
                ].join(''), $menuDom = $(menuDom);

            $menuDom.find('.menu-icon-warp').append(menuIconNew);
            //未开启图标
            if(!hasIcon){
                $menuDom.find('.menu-icon-warp').hide();
                $menuDom.find('.menu-text').css({'padding-left':'12px'});
            }else{
                $menuDom.find('.menu-text').css({'padding-left':'0'});
            }
            //未开启箭头
            if(!hasArrow) $menuDom.find('.menu-arrow').hide();
            return $menuDom;
        },

        layoutList: function() {
            var _this = this;
            var listWrapper = $("<div class='grid-list-wrapper'></div>");
            this.options.listData.map(function(json) {
                var row = {};
                if(json.type == "isSeparationLine"){
                    //增加分割线的时候图标底部加上下划线
                    listWrapper.find('.menu-icon-warp:last').css({"border-bottom": "1px solid #e8e8e8"});
                    row = $("<div class='separation-line'></div>");
                }else{
                    row = _this.createListDom(json);
                }
                listWrapper.append(row);
            });
            listWrapper.find('.menu-icon-warp:last').css({"border-bottom": "1px solid #e8e8e8"});
            return listWrapper;
        },

        render: function() {
            this.$el.empty();
            this.options.layout = this.options.layout || this.defaults.layout;
            this.options.listData = this.options.listData || this.defaults.listData;
            var layout = this.layoutList();
            this.$el.append(layout);
            return this;
        }
    });
});
