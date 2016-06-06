define([
  './ColumnLayoutView'
], function(ColumnLayoutView) {

  return ColumnLayoutView.extend({
    type: 'SplitContainerView',


    constructor: function(options) {
      this.designerCanDragIn = false; // FIXME 不要绑定IDE设计器相关的代码
      ColumnLayoutView.apply(this, arguments);
    }
  });
});
