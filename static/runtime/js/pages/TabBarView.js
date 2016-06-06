define(function(require){

  var BaseView = require('../components/BaseView');

  /*
   * 路由规则：
   * tabbar.html            tabbar页面，默认的tab
   * tabbar.html#tab1       tabbar页面，特定的tab，如果tab1是一个navigationview，显示rootview
   * tabbar.html#tab1/page2 tabbar页面，特定的tab，如果tab1是一个navigationview，显示page2
   */

  // 配置：
  // {
  //   type: "TabBarView",
  //   items: [
  //     {label: "main", href: "#main", icon: "glyphicon glyphicon-asterisk"}
  //   ]
  // }
  return BaseView.extend({

    type: 'TabBarView',

    constructor: function() {
      // initialize instance variable
      this.tabs = {};
      this.currentTab = null;
      BaseView.prototype.constructor.apply(this, arguments);
    },

    render: function(){
      // .bar-tab
      var tab = '<nav class="bar bar-tab"></nav>';
      this.$el.append(tab);

      this.configure(this.options);

      return this;
    },

    /**
     * 分析路径
     * @param  {String} path 全路径
     * @return {Object}      {current: 当前路径, remains: 剩余未消化的路径}
     */
    getPaths: function(path){
      var segments = path.split('/');
      // 所有可能的页面路径
      // 例如path为：a/b/c，那么可能的路径（paths）有：['a/b/c', 'a/b', 'a']
      // 从长到短排序
      var paths = segments.map(function(each, index){
        return segments.slice(0, index + 1).join('/');
      }).reverse();
      // 查找匹配的路径，最长路径优先
      var current_path = _.find(paths, function(each){
        return loader.hasPage(each);
      });
      // 剩余路径
      var remains_path = current_path ? path.slice(current_path.length + 1) : '';

      return {current: current_path, remains: remains_path};
    },

    route: function(path, queryString){
      // 依此使用：1.路由路径，2.默认页面，3.第一个页面
      path = path || this.options.defaultPage || this.options.items[0].href.substr('1');
      if (!path) {
        console.warn("no path provided");
        return;
      }
      var paths = this.getPaths(path);
      console.log("TabBarView: current path: %s, rest path: %s", paths.current, paths.remains);

      // 激活tab，默认为第一个tab
      this.setActive(paths.current, paths.remains, queryString);
    },

    // 创建一个Tab项
    _createItem: function(item){

      var a = document.createElement('a');
      a.classList.add('tab-item');

      if (item.display=="imageUpload") {
        var img = document.createElement('img');
        img.src = item.icon;
        a.appendChild(img);
      } else {
        var icon = document.createElement('span');
        $(icon).attr('class', item.icon);
        $(icon).attr('style', "top: 0;margin-bottom: 7px;width: 100%;height: auto;font-size: 20px;");
        a.appendChild(icon);
      }

      var label = document.createElement('span');
      label.classList.add('tab-label');
      $(label).attr("style", "line-height: 1;height: auto;");
      a.appendChild(label);

      a.href = item.href;

      label.innerText = item.label;

      return a;
    },

    configure: function(options){
      if (options.items) {
        var fragment = document.createDocumentFragment();
        fragment = options.items.reduce(_.bind(function(fragment, item){
          fragment.appendChild( this._createItem(item) );
          return fragment;
        }, this), fragment);

        this.$('nav').empty().append(fragment);
      }

      // TODO: 考虑支持右置，左置等
      if (options.barPosition == 'top') {
        this.$('.bar').addClass('bar-tab-top');
      } else {
        this.$('.bar').removeClass('bar-tab-top');
      }

    },
    // id: 页面ID，可为字符串ID，或数字序号
    // rest_path: 剩余的路由
    // queryString: 查询字符串
    setActive: function(id, rest_path, queryString){

      console.log("TabBarView: setActive: %s", id);

      if (!id || !this.options.items) return;

      // 统一转变成为序号
      if (_.isString(id)) {
        var nid = _.findIndex(this.options.items, function(each){
          return each.href.substr(1) == id;
        });
        if (nid == -1) {
          // current page should be open in current tab, don't consume the route
          rest_path = _.compact([id, rest_path]).join('/');
          id = this.currentTabIndex || 0; // current tab or the first one
        } else {
          id = nid;
        }
      }

      var enter;
      if (this.currentTab && id > this.currentTabIndex) {
        enter = true;
      } else {
        enter = false;
      }
      console.log('TabBarView: switch tab at: %s', enter ? 'right' : 'left');
      // id not in the tabs, id will be -1, the fallback page will be used
      this.createTab(id, rest_path)
      .then(function(page){
        var previousTab = this.currentTab; //要消失的tab
        this.currentTab = page; //要显示的tab

        // bind a special self varialble
        window.self = page; // current page
        if (id != this.currentTabIndex) {
          // 调用上一页的暂停逻辑，比如切换时关闭视频播放器等，视频播放通常不会由于dom hide而停止
          previousTab && previousTab.onPause && previousTab.onPause();
        }
        // 消化剩余路由
        this.currentTab.route && this.currentTab.route(rest_path, queryString);
        if (id != this.currentTabIndex) {
          // 当页面被带入前台显示时调用其onResume方法
          this.currentTab.onResume && this.currentTab.onResume();
        }
        // 记录最近的tab页id
        this.currentTabIndex = id;

        if (previousTab && this.options.animate) {
          // switch tab using animation
          var animateOut = enter ? 'slideOutLeft' : 'slideOutRight';
          previousTab.$el.addAnimate(animateOut, function(){
            previousTab.$el.removeAnimate();
            // 动画完成之后必须关闭
            previousTab.$el.hide();
          }.bind(this));
          var animateIn = enter ? 'slideInRight' : 'slideInLeft';
          // 动画进行之前显示
          this.currentTab.$el.show();
          this.currentTab.$el.addAnimate(animateIn, function(){
            this.currentTab.$el.removeAnimate();
          }.bind(this));
        } else if (previousTab && previousTab != this.currentTab) {
          // switch tab using show/hide only when tab realy switched
          this.currentTab.$el.show();
          previousTab.$el.hide();
        }
        var items  = this.options.items;

        _.each(items,function(item,i){
          if(item.afterIcon!="" && item.afterIcon!=undefined){
            var url = items[i].icon;
            $(this.el.querySelector('nav').children[i]).find("img").attr("src",url);
          }
        }.bind(this));
        if(items[id].afterIcon!="" && items[id].afterIcon!=undefined){
          var afterIcon = items[id].afterIcon;
          $(this.el.querySelector('nav').children[id]).find("img").attr("src",afterIcon);
        }
        // change active style
        this.$('.tab-item.active').removeClass('active');
        this.el.querySelector('nav').children[id].classList.add('active');
      }.bind(this))
      .catch(function(err){
        console.error(err)
        alert("页面加载失败")
      });
    },

    // 创建一个tab
    // @param id - 当前tab对应的id
    // @param fallback - 如果当前页面不对应任何tab的时候，使用fallback指定的页来创建页
    createTab: function(id, fallback){
      if (id < 0 && fallback) {
        id = 0;
      }
      if (id < 0) {
        console.warn("tab id is incorrect");
        return;
      }
      // 兼容id和下标，如果是下标，则需要截掉href的#
      id = _.isString(id) ? id : this.options.items[id].href.substr(1);
      if (id) {
        fallback = id; // 正常情况，fallback页即是id对应页
      }

      if (!this.tabs[id]) {
        // 没有缓存
        return loader.getPageConfig(fallback)
        .then(function(config){
          if (config.type != 'NavigationView') {
            // create NavigationView for each tab
            console.log("create a navigation view for: " + id);
            // replace current page config with a NavigationView
            config = {type: 'NavigationView', rootPage: id};
          }
          // create page
          return loader.createPage(config);
        })
        .then(function(page){

          this.tabs[id] = page.render();
          this.tabs[id].$el.appendTo(this.el);

          return this.tabs[id];
        }.bind(this));
      } else {
        // 有缓存
        return Promise.resolve(this.tabs[id]);
      }
    }
  });
});
