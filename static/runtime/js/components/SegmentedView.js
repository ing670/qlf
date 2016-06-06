define(['underscore', './BaseView'], function(_, BaseView) {

  return BaseView.extend({

    type: 'SegmentedView',

    itemTemplate: _.template("<a class='control-item' data-index='<%=index%>'><%=name%></a>"),

    events: {
      "click a": "onSelect"
    },

    render: function() {
      this.$('.segmented-control').remove();

      this.$el.append('<div class="segmented-control" style="width:100%"></div>');

      if (this.options.items) {

        var $f = $(document.createDocumentFragment());

        _.reduce(this.options.items, _.bind(function($f, each, i) {
          each = _.defaults(each, {
            name: '',
            index: i
          });
          var a = this.itemTemplate(each);
          return $f.append(a);
        }, this), $f);

        this.$el.find('.segmented-control').append($f);

        this.setActive(0);
      }

      // TODO: ratchet自带的样式
      // .segmented-control-primary
      // .segmented-control-positive
      // .segmented-control-negative
      if (_.contains([''], this.options.theme)) {

      }

      return this;
    },

    setActive: function(index) {
      this.$("a").removeClass('active');
      this.$("a[data-index='" + index + "']").addClass('active');

      var item = this.options.items[index];
      if (item && item.action) { //事件
        this.getPage() && this.getPage().trigger(item.action, this.options);
      } else {
        //TODO: 其他触发方式，例如URL
      }
    },

    onSelect: function(event) {
      var index = $(event.target).attr('data-index');
      this.setActive(index);
    }
  });
});
