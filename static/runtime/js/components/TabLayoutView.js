// TabLayoutView  tab控件
// ---
//
// className:TabLayoutView
// author: xurz
//
// 配置
//
// | 变量 | 类型 | required | 描述 |
// |----|------|----------|-----|
// | tabs | [] | false | tab页面 |
//
// ```js
//  {
//      tabs:[{title:"标题1"},{title:"标题2"}],
//      tabsOutlined :"style1",
//      components: [{
//          type: "ContainerView",
//          components:[{
//              type:'ImageView',
//              defaults:"ImageView"
//          }]
//      },{
//          type: "ContainerView",
//          components:[{
//              type:'TextView',
//              defaults:"ImageView"
//          }]
//      }]
//  }
// ```
// ```增加多样式选择
// ```通过配置tabsOutlined进行修改
// ```可配置参数[style1、style2、style3]
define([
    './ContainerView'
], function(ContainerView) {
    return ContainerView.extend({
        // 对应到css
        type: 'TabLayoutView',

        events: {
            'click .tab-nav-cell': "selTab"
        },
        constructor: function () {
          this.contents = {};
          this.navs = {};
          ContainerView.apply(this, arguments);
        },
        selTab: function(e) {
            e.stopPropagation();
            var key = $(e.target).parents('.tab-nav-cell').attr('tabkey') || $(e.target).attr('tabkey');

            for (var el in this.contents) {
                this.contents[el].hide();
            }
            this.contents[key].css({"display":"block","width":"100%"});

            for (var el in this.navs) {
                this.navs[el].removeClass('tab-choice');
            }
            this.navs[key].addClass('tab-choice');
        },
        render: function() {
            this.$el.empty();
            this.components = _.chain(this.options.components || [])
            .map(function(each){
                return this.createComponent(each);
            }.bind(this)).compact().value();

            var _this = this;
            var tabWrapper = $('<div class="tab-wrapper"></div>');
            var tabNav = $('<div class="tab-nav"></div>');
            var tabNavWrapper = $('<div class="tab-nav-wrapper"></div>');
            var tabContent = $('<div class="tab-content"></div>');
            var tabsOutlined = this.options.tabsOutlined?this.options.tabsOutlined:this.defaults.tabsOutlined;

            tabNavWrapper.addClass(tabsOutlined);
            var titleStyle = "num" + this.options.tabs.length;
            var width = 100 / this.options.tabs.length
            var cellWidth = "width:" + width + "%";
            this.options.tabs.forEach(function(tab, index) {

                if (tab.title == "") return;

                var tabNavCell = $('<div class="tab-nav-cell" tabkey="' + index + '" style="'+cellWidth+'"><span class="' +titleStyle+ '">' + tab.title + '</span></div>');

                if (index == 0) tabNavCell.addClass('tab-choice');

                _this.navs[index] = tabNavCell;
                tabNavWrapper.append(tabNavCell);

                var tabContentItem = $('<div class="tab-content-item-wrapper" tabkey="' + index + '"></div>');

                if (index == 0) tabContentItem.css({"display":"block","width":"100%"});

                var child = _this.components[index];

                if(child){
                    tabContentItem.append(_this.designerWraperComponent(child.render()).el);
                }

                _this.contents[index] = tabContentItem;
                tabContent.append(tabContentItem);
            });
            tabNav.append(tabNavWrapper);
            tabWrapper.append(tabNav);
            tabWrapper.append(tabContent);
            this.$el.append(tabWrapper);
            return this;
        },
    });
});
