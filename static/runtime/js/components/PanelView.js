define([
    './PanelLayoutView'
], function(PanelLayoutView) {

    return PanelLayoutView.extend({
        type: 'PanelView',
        designerCanDragIn:false,
        _getComponents:function(){
            this.components = _.chain(this.options.components || [])
                .map(function(each){
                    return this.createComponent(each);
                }.bind(this))
                .compact()
                .value();
        }
    });
});
