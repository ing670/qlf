define(['require', './PageView'], function(require, PageView) {
  var Backbone = require('backbone');

  var Item = Backbone.Model.extend({

    idAttribute: "_id",

    convertURL:function(url){
      if (url!=undefined && url.indexOf("http://") != 0) {
        url = url.replace(/^[\.\/]+/g, "/");
        url = ((window.app && window.app.url) ? window.app.url : "") + url;
      }
      return url ;
    },

    url: function() {
      var path = this.convertURL('/api/data/');
      this.collection_id && (path += (this.collection_id + "/"));
      this.item_id && (path += (this.item_id + "/"));
      return path;
    }
  });

  return PageView.extend({
    type: 'PageDetailView',
    className:function(){
      return "PageView";
    },
    postRoute: function() {

      var item = new Item();
      item.collection_id = this.params.collection_id || this.options.collection_id;
      item.item_id = this.params.id || this.options.model_id;
      item.fetch({
        success: function(data) {
          this.setModel(data);
        }.bind(this)
      });
    }

  })
})
