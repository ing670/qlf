(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['exports', 'underscore', 'backbone'], function(exports, _, Backbone) {
      return factory(root, _, Backbone);
    });

  } else {
    factory(root, root._, root.Backbone);
  }

})(this, function(root, _, Backbone) {

  // Backbone View Animation Extentions
  // =========================

  var animations = [
    'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight',
    'slideInUp', 'slideInDown', 'slideOutUp', 'slideOutDown',
    'fadeIn', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInUp', 'fadeInUpBig',
    'fadeOut', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig'
  ];

  //animate
  var animationExtentions = {
    animate: function(name, options) {
      options = options || {reverse: true};

      return new Promise(function(resolve, reject){
        this.$el.addClass('animated ' + name);
        this.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
          if (options.reverse) this.$el.removeClass('animated ' + name);
          resolve();
        }.bind(this));
      }.bind(this));

    }
  };

  //transform animation name array to <name: fn> mapping json object
  animationExtentions =
    animations.reduce(function(_this, animation) {
      fn_name = 'animate' + animation.charAt(0).toUpperCase() + animation.substring(1);
      _this[fn_name] = function(options) {
        return this.animate(animation, options);
      }
      return _this;
    }, animationExtentions);

  // add to View prototype
  _.extend(Backbone.View.prototype, animationExtentions);

  // return this animation mixin
  return animationExtentions;
});
