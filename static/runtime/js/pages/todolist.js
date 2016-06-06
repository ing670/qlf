// documents here...
define(['./PageView', "jquery"], function(PageView, $){
  return PageView.extend({
    initialize: function() {
      // say console
      console.log ("this is a initialize process...");
      this.findComponent('todoList').on('itemSelect', function(list, item, i, e){
        //alert('row selected');
      });
      this.findComponent('todoList').on("addRow", function(row){
        // manipulate the list row here
        //alert(row);
      });
    },

    addTodo: function(e) {
      if (e.keyCode == '13') {
        //alert(e.target.value);
        // add to the collection
        var collection = this.findComponent('todoList').collection;
        if (collection) {
          collection.create({_id:null, title: e.target.value});
        }
        e.target.value = '';
      }
    }
  });
});
