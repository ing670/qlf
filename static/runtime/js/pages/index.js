// documents here...
define(['./PageView', "jquery"], function(PageView, $){
  return PageView.extend({
    initialize: function() {

    },
    onResume:function(){
      console.log(arguments);
    },
    onRender:function(){
      console.log(arguments);
    },

  });
});
