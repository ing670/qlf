define([
  './ContainerView'
], function(ContainerView) {

  return ContainerView.extend({
    type: 'StaticListView',
    events: {
        "click .ListItemView": "onClick"
    },
    initialize: function(options){
        var parentId = options.id;
        var compoentsId = _.pluck(options.components, 'id');
        compoentsId = _.compact(compoentsId);
        options.components.forEach(function(item) {
            var comId = item.id;
            if (!comId) {
                var index = 1;
                var tempId = parentId + '_ListItemView' + index;
                while(compoentsId.indexOf(tempId) > -1) {
                    index++;
                    tempId = parentId + '_ListItemView' + index;
                }
                compoentsId.push(tempId);
                item.id = tempId;
            }
        });
    },
    onClick: function(e) {
        this.components && this.components.forEach(function(item) {
            if (item.id == e.currentTarget.id) {
                if (e.target.id == e.currentTarget.id) {
                    item.triggerEvent("click");
                } else {
                    var triggers = this.getPage().options.triggers;
                    var triggersName = [];
                    if (triggers) {
                        triggersName = _.pluck(triggers, 'target');
                    }
                    var triggerEvent = true;
                    if (item.components) {
                        item.components.forEach(function(com) {
                            if (triggersName.indexOf(com.id) > -1) {
                                triggerEvent = false;
                            }
                            if (com.options && com.options.href && (com.options.href.startsWith('#')  || com.options.href.startsWith('http'))) {
                                triggerEvent = false;
                            }
                        }.bind(this))
                    }
                    if (triggerEvent) {
                        item.triggerEvent("click");
                    }
                }

            }
        }.bind(this))
    }
  });
});
