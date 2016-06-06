(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['exports', 'underscore', 'backbone'], function(exports, _, Backbone) {
      return factory(root, _, Backbone);
    });

  } else {
    factory(root, root._, root.Backbone);
  }

})(this, function(root, _, Backbone) {

  var origin_remove = Backbone.View.prototype.remove;
  //
  // Backbone View Hierachy extension
  //
  var api = {

    // getter method
    getChildren: function() {
      if (!this.children) {
        this.children = [];
      }
      return this.children;
    },

    // find a child by id from the hierachy
    // Breadth First Search
    findChild: function(id) {
      var result = _.find(this.getChildren(), function(child) {
        return child.el.id == id;
      });

      if (!result) {
        var container = _.find(this.getChildren(), function(child) {
          return child.find(id);
        });
        result = container.find(id);
      }

      return result;
    },

    addChild: function(child) {
      this.getChildren().push(child);
    },

    removeChild: function(child) {
      var index = this.getChildren().indexOf(child);
      if (index != -1) this.getChildren().splice(index, 1);
    },

    disposeChildren: function() {
      _.each(this.children, function(child) {
        if (child.dispose) {
          child.dispose();
        }
      });

      this.children = null;
    },

    //
    dispose: function() {

      this.disposeChildren();

      this.remove();
    },

    remove: function() {

      this.disposeChildren();

      origin_remove.apply(this, arguments);
    }

  };

  _.extend(Backbone.View.prototype, api);

});
