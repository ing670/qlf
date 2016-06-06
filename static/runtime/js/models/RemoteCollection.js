/**
 * 远端collection，根据id适配
 // TODO add support for any url
 state: {
   firstPage: 1,
   lastPage: null,
   currentPage: null,
   pageSize: 25,
   totalPages: null,
   totalRecords: null,
   sortKey: null,
   order: -1
 },
 */
define(['./BaseCollection', 'underscore'], function(BaseCollection, _) {

  var PARAM_TRIM_RE = /[\s'"]/g;
  var URL_TRIM_RE = /[<>\s'"]/g;
  String.prototype.startsWith = function(s) {
    return this.slice(0, s.length) == s
  }
  String.prototype.endsWith = function(s) {
    return s == '' || this.slice(-s.length) == s
  }

  // for mongodb's _id attribute
  var model = Backbone.Model.extend({
    idAttribute: "_id"
  });

  return BaseCollection.extend({
    mode: 'server',

    model: model,

    queryParams: {
      currentPage: "page",
      pageSize: "pageSize",
      totalRecords: "totalRecords"
    },

    state: {
      pageSize: 25
    },

    initialize: function(models, options) {
      var self = this;
      if (options) {
        this.id = options.id;
        this.options = options;
        if (options.conditions) {
          this.conditions = _.reduce(options.conditions, function(conditions, obj) {
            var condition = obj.key + obj.operator + obj.value;
            self.queryParams[obj.key] = obj.value;
            return conditions + '&' + condition;
          }, '');
        }
      }
    },
    fetch: function(fetchOption) {
        /*var fetchOption = {};
        if (config && this.options && this.options.config) {
            this.options.config.fetchOption = this.options.config.fetchOption || {};
            // 把传入的config与option里的config合并 合并规则：传入的覆盖配置的
            // FIXME 此处__.default方法不满足要求 此为暂时解决方案
            this.options.config.fetchOption.headers = this.options.config.fetchOption.headers || {};
            this.options.config.fetchOption.headers = _.defaults(config.headers,this.options.config.fetchOption.headers);
            this.options.config.fetchOption = _.defaults(config,this.options.config.fetchOption);

            fetchOption = this.options.config.fetchOption;
        }*/
        Backbone.Collection.prototype.fetch.apply(this,[fetchOption]);
    },
    setUrl: function(url) {
        if (url) {
            this.options.url = url;
        }
    },
    url: function() {
        // 1.开发环境： 一.如果第三方接口,使用代理  二,如果是平台直接请求
        // 2.生产环境: 一直接请求
        var _url = "";
        if (this.options.url && $.trim(this.options.url) != "") {
          //第三方接口
            _url = window.library.getServiceURL(this.options.url);
            // if (window.app.proxy_enable) {
            //   // 如果配置了代理
            //   _url = "/api/data/"+this.id+"?thirdUrl=" + _url;
            // }
        } else {
          // 平台的接口
           _url = window.library.getServiceURL((window.app.url || "") + "/api/data/" + this.id);
        }
        return _url;
  },

    parseState: function(data, queryParams, state, options) {
      var records = options.xhr.getResponseHeader("X-totalRecords") || 0;
      return {
        totalRecords: parseInt(records)
      };
    }

  });

});
