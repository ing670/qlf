define(['backbone'], function(StaticCollection){
  return StaticCollection.Collection.extend({
    items: [
      {
        "_id":'1',
        "title": "whatever you do 1"
      },
      {
        "_id":'2',
        "title": "whatever you do 2"
      },
      {
        "_id":'3',
        "title": "whatever you do 3"
      },
      {
        "_id":'4',
        "title": "whatever you do 4"
      },
      {
        "_id":'5',
        "title": "whatever you do 5"
      },
      {
        "_id":'6',
        "title": "whatever you do 6"
      },
      {
        "_id":'7',
        "title": "whatever you do 7"
      },
    ],
    // for static collection, populate items in this method
    fetch: function() {
      this.set(this.items);
    }
  });
});
