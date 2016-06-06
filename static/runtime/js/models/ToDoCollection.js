define(["backbone", "./MongoRestCollection"], function(Backbone, MongoRestCollection){
  var todo = Backbone.Model.extend({
    defaults: {
      "title": "whatever you do"
    }
  });
  return MongoRestCollection.extend({
    model: todo,
    url: "/api/todo"
  });
});
