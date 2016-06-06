// 根据MongoRestAPI实现的PagableCollection，提供一个快速的REST API实现方式
// 考虑新设计的应用数据集合可以直接参照此API实现
// ## 查询响应
//
// ```javascript
// {
//  "offset" : 0,
//  "rows": [
//   { "_id" : { "$oid" : "55ecfcf80338b15199d32895" }, "title" : "you objective 1", "progress" : "0%", "done" : false }
//  ],
//
//  "total_rows" : 1 ,
//  "query" : {} ,
//  "millis" : 0
// }
// ## 操作响应
// `{ "ok" : true }`
define(['backbone', './BaseCollection', 'underscore'], function(Backbone, BaseCollection, _){
  return BaseCollection.extend({
    mode: 'server',

    initialize: function()
    {
      BaseCollection.prototype.initialize.apply(this, arguments);
      this.model.prototype.idAttribute = '_id';
      // intercept Backbone.sync's method to walk around mongodb PUT bug
      var _sync = Backbone.sync;
      Backbone.sync = function(method, model, options) {
        if (method == 'update') {
          options.contentType = 'application/json';
          options.data = JSON.stringify(_.omit(model.toJSON(), '_id'));
        }
        // then use Backbone's sync
        _sync(method, model, options);
      }
    },
    url: function() {
      if(typeof this.url =="String"&&this.url.toLowerCase().startsWith("http://"))
        return this.url+"/"+this.cid
      else
        return (window.app ? window.app.url : "") + "/api/v2/collections/" + this.cid ;
    },
    parse: function(data) {
      // cann't fullfill a page
      if (data.length < this.state.pageSize) {
        this.trigger('end', this); // trigger an end event
      }
      return data;
    },
    // in server mode always assume has next page
    hasNextPage: function()
    {
      return true;
    },

    state:
    {
      firstPage: 0,
      pageSize: 10,
    },

    queryParams: {
      currentPage: null,
      pageSize: 'limit',
      skip: function(){ return this.state.pageSize * this.state.currentPage },
      totalRecords: null,
      // totalPages: null
    }
  });
});
