define(['../components/BaseView', './PageView','backbone','underscore','../loader'], function(BaseView, PageView, Backbone,_,loader){


  return BaseView.extend({

    type: "NavigationView",

    initialize: function(options){
      BaseView.prototype.initialize.apply(this, arguments);

      this.rootPage = options.rootPage;
      // stack to store the views, [{path: 'a', view: a}, {path: 'b', view: b}]
      this.stack = [];
      // trace the pause and resume state
    },

    render: function(){

      return this;
    },

    remove: function(){
      // 销毁时需要清空栈和其中的页面，防止内存泄漏
      while (this.stack.length > 0) {
        var item = this.stack.pop();
        item.view.remove();
      }
      BaseView.prototype.remove.apply(this, arguments);
    },
    /**
     * 栈顶的页面调用其onPause方法
     */
    onPause: function() {
      if (this.stack.length > 0) {
        var topView = this.stack[this.stack.length - 1].view;
        topView && topView.onPause && topView.onPause();
      }
    },
    /*
     * 栈顶的页面调用其onResume方法
     */
    onResume: function() {
      if (this.stack.length > 0) {
        var topView = this.stack[this.stack.length - 1].view;
        topView && topView.onResume && topView.onResume();
      }
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
      console.log(paths);
      //var current_path = _.find(paths, function(each){
      //
      //  return !(each.indexOf("/") > 0);
      //});
      //if (current_path == null) {
      //  alert("page not exists.");
      //  return {};
      //}
      // 剩余路径
      var remains_path = paths.slice(paths.length + 1);

      return {current: paths[0], remains: remains_path};
    },

    route: function(path, queryString){
      // 配置的默认页面

      path = path || this.options.rootPage;
      if (!path) {
        console.warn('NavigationView: no path provided.');
        return;
      }
      console.log("fuck"+path);
      var paths = this.getPaths(path);
      if (!paths.current) {
        console.warn('page not exists.');
        return;
      }
      console.log("NavigationView: current path: [%s], rest path: [%s]", paths.current, path.remains);
      // 如果NavigationView从其他页面导航进入另外一个NavigationView的栈，先复原没错
      // 此时在新的NavigationView实例里面，拿不到关联的上一页，没办法做现场的恢复
      // Backbone.$('nav.bar').attr('style', '');
      Backbone.$('nav.bar').css({"transform": "translate3d(0,0,0)"});
      // 是否回退
      var goingBack = this.stack.length > 1 && this.stack[this.stack.length - 2].path == path;

      // 当前页面，栈顶
      var currentPage = this.stack[this.stack.length - 1] && this.stack[this.stack.length - 1].view;

      // 当返回页为不缓存页面，不管栈重新创建
      if (goingBack) {
        // 回退
        var backPage = this.stack[this.stack.length - 2].view;
        // 调用当前页的onPause,必须发生在remove之前
        currentPage && currentPage.onPause && currentPage.onPause();
        // 如果当前页退出时需要做过场效果
        if (currentPage && currentPage.transit) {
          currentPage.transit(backPage, "out");
        }
        // 如果进入的page有过场动画效果
        if (backPage.transit) {
          // 如果返回到了滑出页，那么取消对动画结束删除滑出页事件的监听
          currentPage.$el.unbind("transitionend webkitTransitionEnd");
          // 延迟到下次滑走时才处理的清理工作 FIXME 硬编码，还有更好的方法解决么？
          backPage.clean = function(){
            currentPage.remove();
          }.bind(backPage);
          backPage.transit(currentPage, "in");
        } else {
          // 在NavigationView中全局的转场动画，无需每个页面单独配置
          // FIXME 放入此处和页面自己的transit函数可能冲突
          if(this.options.animate) {
            currentPage.$el.addAnimate('slideOutRight')
            .then(function(){
              currentPage.remove();
            });
            backPage.$el.addAnimate('slideInLeft');
          } else {
            currentPage.remove();
            backPage.$el.show();
          }
        }
        // FIXME 当先进入详情，然后再导航到列表页时，此时复合goingBack条件，
        // 以前列表页每次重新创建，而详情页会被保留，如果详情页有nocache，
        // 那么在创建列表时，详情就被销毁，所以能得到正确的逻辑
        // 重要：无论如何都要把之前的栈顶去掉！必须保证栈顶就是当前页
        this.stack.pop();
        // 出栈的也重新执行路由
        backPage.route && backPage.route(path.remains, queryString);
        // 从缓存中提取的页面也重新填充数据等，此时dom是准备好的
        backPage.onResume && backPage.onResume();
        //bind to self varialble
        window.self = backPage;

      } else {
        // not always push to stack, check the last page
        if (this.stack.length == 0 || this.stack[this.stack.length - 1].path != paths.current) {
          // 追加

          loader.createPage(paths.current).then(function(nextPage){
            if (!nextPage) {
              console.log("cann't create page:" + paths.current);
              return;
            }
            // 调用当前页的onPause，在slide时可能remove，所以必须在remove发生之前调用
            currentPage && currentPage.onPause && currentPage.onPause();
            // slide out current slide page
            // 如果当前页面有过场效果，先执行过场效果
            if (currentPage && currentPage.transit) {
              currentPage.transit(nextPage, "out");
            }
            // assurance, don't let the stack too large, only keep the last three
            // max 50 items in the stack, only keep last 10 items
            // TODO 如果用户指定此NavigationView直接不缓存，那么栈永远只留上一个页面即可，并且会及时销毁
            if (this.options.nocache) {
              // if no cache, always clean stack, only keep the last one
              if (this.stack.length > 1) {
                this.stack = this.stack.slice(-1);
                this.$el.empty();
                // re-render the last one
                this.$el.append(this.stack[this.stack.length - 1].view.render().el);
              }
            } else {
              if (this.stack.length > 50) {
                this.stack = this.stack.slice(-10);
                this.$el.empty(); //FIXME may be re-render the page in the stack?
                // re-render the last one
                this.$el.append(this.stack[this.stack.length - 1].view.render().el);
              }
            }
            // 消化剩余路由
            // 带模板的页面由于可异步加载模板，所以此时无法保证dom已经准备好了
            nextPage.route && nextPage.route(path.remains, queryString);
            // 渲染页面
            this.$el.append(nextPage.render().el);
            // bind current page to window.self
            window.self = nextPage;
            // 如果将被载入页有过场效果需要执行
            if (nextPage.transit) {
              nextPage.transit(currentPage, "in");
            } else {
              // 使用NavigationView自带的默认的过场动画效果
              // FIXME 跟滑出页或者其他页面自带的转场逻辑可能冲突
              if (currentPage && this.options.animate) {
                currentPage.$el.addAnimate('slideOutLeft');
                nextPage.$el.addAnimate('slideInRight');
              } else {
                currentPage && currentPage.$el.hide();
              }
            }
            // 当前页不缓存，移除DOM
            if (currentPage && currentPage.options.nocache) {
                currentPage.$el.remove();
                this.stack.pop();
            }

            // 不管是否nocache 都入栈，在切换页面时才能拿到当前页面，对DOM作操作
            this.stack.push({path: paths.current, view: nextPage});
          }.bind(this))
          //.catch(function(err){
          //  console.warn("NavigationView: page [%s] not found, fail to navigate", paths.current);
          //  console.error(err);
          //});
        } else {
          // FIXME 有的时候会造成逻辑走到这个路径
          console.log("Not possible for NavigationView, cache problem")
        }
      }
    }

  });
});
