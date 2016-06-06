// documents here...
define(['require', './PageView'], function(require, PageView){
  return PageView.extend({
    initialize: function() {

    },
    postRoute: function() {
      // try from the collection
      var title = this.findComponent('todotitle');
      var todoCollection = window.application.getCollection('todo');
      // get model and bind to page display
      var todo = todoCollection.get(this.params.id);
      if (!todo) {
        // use direct fetch from server
        var TodoModel = Backbone.Model.extend({urlRoot : '/api/todo'});
        todo = new TodoModel({id: this.params.id});
        todo.fetch({
          success: function() {
            title.$el.html(todo.get("title"));
          }
        });
      } else {
        title.$el.html(todo.get("title"));
      }
    }
  });
});
