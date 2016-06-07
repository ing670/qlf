define(['backbone', 'backbone.paginator'], function(Backbone, PageableCollection) {

  /*
   * 需要支持：
   * 客户端搜索
   * 服务端搜索
   */
  return PageableCollection.extend({

    id: '', //数据源id

    url: '', //数据源路径

    mode: "infinite",

    //初始化状态
    state: {
      pageSize: 10,
      firstPage: 1,
    },

    initialize: function() {
      // 如果子类提供了url，则先直接使用路由中的替换
      if (this.url && typeof this.url == 'string'
        && window.library.getServiceURL) {
        var _url = this.url;
        this.url = function() {
          return window.library.getServiceURL(_url);
        }
      }
    },

    search: function(query) {
      if (_.isEmpty(query)) {
        //过滤条件为空，恢复全集
        this.trigger("reset", this.fullCollection.models);
      } else if (_.isFunction(query)) {
        // 使用迭代器过滤
        var filtered = this.fullCollection.filter(query).map(function(each) {
          return each.clone();
        });
        this.trigger("reset", filtered);
      } else {
        // 使用map条件过滤
        var filtered = this.fullCollection.where(query).map(function(each) {
          return each.clone();
        });
        this.trigger("reset", filtered);
      }
    },

    groupBy: function() {},

    onError: function(collection, response, options) {
      console.log('on error');
      this.trigger('error', this);
    },
  });
});
