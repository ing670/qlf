// documents here...
define(['./SlidePageView','backbone'], function(SlidePageView,Backbone){
  return SlidePageView.extend({
    events:
    {
      'click #button1' : 'onClick'
    },

    initialize: function() {
    },


    onClick: function(e) {
      Backbone.history.navigate("#about",{trigger:true});
    }
  });
});
