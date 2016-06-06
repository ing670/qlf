// documents here...
define(['./PageView','backbone'], function(PageView,Backbone){
  return PageView.extend({
    //events:
    //{
    //  'click #btn1' : 'onClick'
    //},

    initialize: function() {
      // say console
      console.log ("this is a initialize process...");
      this.findComponent("abc").listenTo(this.findComponent("xxx"),'someevent',function(){

      });
    },

    render:function(){
      this.$el.append("<div>hello world</div>");
      return this;
    },
    onRender: function() {
      this.$('#placeholder1').append("<b>hello</b>");
    },
    onResume:function(){

    },
    postRoute:function(){
      this.params.xx;

    }
    //
    //onClick: function() {
    //  // alert('say hi from click');
    //  // this.triggerEvent("click", {"p": 1});
    //
    //  Backbone.history.navigate("#drawerlayout",{trigger:true});
    //
    //},
    //
    //onBtnClick: function(sender, options) {
    //  alert("response to test button," + options.p);
    //}
  });
});
