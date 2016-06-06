(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['exports', 'underscore', 'backbone'], function(exports, _, Backbone) {
      return factory(root, _, Backbone);
    });

  } else {
    factory(root, root._, root.Backbone);
  }

})(this, function(root, _, Backbone) {

  var ios = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
  var android = navigator.userAgent.match(/(Android)/g);

  /*
   * backdrop: true | 'static', specify static for a backdrop which doesn't close the modal on click.
   * position: 'center' | 'bottom' | 'top'
   */
  var modal = function(options) {
    options = _.defaults(options || {}, {backdrop: true, position: 'bottom'});
    // background mask
    if (options.backdrop != false || options.backdrop == 'static') {
      this.$mask = $("<div class='modal-mask'></div>")
      .css({
        'position': 'fixed',
        'z-index': 11,
        'top': 0,
        'bottom': 0,
        'left': 0,
        'right': 0,
        'background-color': 'rgba(0,0,0,0.3)'
      })
      .appendTo(document.body);

      if (options.backdrop != 'static') {
        this.$mask.on("click", this.dismiss.bind(this));
      }
    }

    // show up
    this.$el.attr('data-position', options.position);
    if (options.position == 'bottom') {
      this.$el.css({
        'position': 'fixed',
        'bottom': 0,
        'left': 0, 'right': 0
      });
    } else if (options.position == 'top') {
      this.$el.css({
        'position': 'fixed',
        'top': 0,
        'left': 0, 'right': 0
      });
    } else if (options.position == 'center') {
      if (options.height == undefined) throw new Error("'height' should provided in 'center' mode");
      this.$el.css({
        'position': 'fixed',
        'top': '50%',
        'margin-top': -options.height / 2,
        'left': 0, 'right': 0
      });
    } else if (options.position == "fullScreen") {
      this.$el.css({
        'position': 'fixed',
        'top': 0, 'bottom': 0,
        'left': 0, 'right': 0
      });
    }

    this.$el.css({'z-index': 12}).appendTo(document.body);

    if (!android) {
      return this.animateSlideInUp();
    } else {
      return new Promise(function(resolve, reject){resolve()});
    }
  }

  // View Modal Support
  // ==================
  //
  var modal = {

    // 旧API叫doModal，新API叫modal，先共存
    modal: modal, doModal: modal,

    dismiss: function(options) {
      var dismiss_executor = function(resolve, reject){
        this.$mask.remove();
        this.remove();
        resolve();
        this.trigger('modal:dismiss', options);
      }.bind(this);

      if (!android) {
        // reverse: false，动画完成后，不删除动画的class
        return this.animateSlideOutDown({reverse: false})
        .then(function(){
          return new Promise(dismiss_executor);
        });
      } else {
        return new Promise(dismiss_executor);
      }

    }

  };

  _.extend(Backbone.View.prototype, modal);

  return modal;
});
