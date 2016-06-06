define([
  './ContainerView'
], function(ContainerView) {

  return ContainerView.extend({
    // 对应到css
    type: 'PanelLayoutView',
    render: function() {
      this.$el.empty();
      var rows =this.options.rows||this.defaults.rows;
      var cols =this.options.cols||this.defaults.cols;
      var regular = this.options.regular || false;
      var RowsTable = null;
      if(this.options.borderStyle == 2) {
        RowsTable = $("<div class='haveBorder'></div>");
      }else{
        RowsTable = $("<div></div>");
      }
      if(regular){
        RowsTable = this._getRegular(RowsTable,rows,cols);
      }else{
        RowsTable = this._getUnRegular(RowsTable,rows,cols);
      }
      this.$el.append(RowsTable);
      return this;
    },
    configure: function(){
      console.log(this.options.components);
      this.components = _.chain(this.options.components || [])
        .map(function(each) {
          var component = this.createComponent(each);
          return component;
        }.bind(this))
        .compact()
        .value();
    },
    _getRegular:function(RowsTable,rows,cols){
      var w  = 100/cols;
      var num = this.components.length;
      for(var k=0 ;k < rows;k++){
        var ColumnTable = null;
        if(k == 0) {
            ColumnTable = $("<div class='col-layout-wraper'></div>");
        }else {
            ColumnTable = $("<div class='col-layout-wraper afterSecondWraper'></div>");
        }
        for (var j=0; j<cols; j++) {
          var cell = null;
          if( j == 0) {
            cell = $("<div class='col-layout-cell' style='height:20px;width:"+w+"%'></div>");
          }else {
            cell = $("<div class='col-layout-cell afterSecondCell' style='height:20px;width:"+w+"%'></div>");
          }
          var child = this.components[(k*cols+j)];
          if(!child){
          var child_cfg = {
              type:"ContainerView",
              components:[
                  {
                      type:'ImageView',
                      href: 'javascript: void 0;',
                      src: './runtime/images/pic-1691.png',
                      borderRadius: 0,
                  }
              ]
          };
          child= this.createComponent(child_cfg);
          this.components.push(child);
          }
          cell.append(this.designerWraperComponent(child.render()).el);
          ColumnTable.append(cell);
        }
        RowsTable.append(ColumnTable);
      }
      return RowsTable;
    },
    _getUnRegular:function(RowsTable,rows,cols){
      var ColumnTable = $("<div class='col-layout-wraper'></div>");
      var w = 100/cols;
      var direction = this.options.direction;
      if(direction=="vertical"){ //纵向
        var className = this.options.displayway == "1" ? "vertical1" : "vertical2";
          for (var i = 0;i < cols; i++) {
            var cell = null;
            if( i == 0) {
              cell = $("<div class='col-layout-cell "+className+"' style='height:30px;width:"+w+"%'></div>");
            }else {
              cell = $("<div class='col-layout-cell afterSecondCell "+className+"' style='height:30px;width:"+w+"%'></div>");
            }
            var child = this.components[i];
            cell.append(this.designerWraperComponent(child.render()).el);
            ColumnTable.append(cell);
          }
        RowsTable.append(ColumnTable);
        return RowsTable;
      }else if(direction=="transverse"){//横向
        for (var i = 0;i < rows; i++) {
          var ColumnTable = null;
          if(i == 0) {
            ColumnTable = $("<div class='col-layout-wraper'></div>");
          }else {
            ColumnTable = $("<div class='col-layout-wraper afterSecondWraper'></div>");
          }
          for(var j=0;j<this.components[i].components.length;j++){
              var w = 100/this.components[i].components.length;
              var cell = null;
              if(j == 0) {
                cell = $("<div class='col-layout-cell' style='min-height:30px;width:"+w+"%'></div>");
              }else {
                cell = $("<div class='col-layout-cell afterSecondCell' style='min-height:30px;width:"+w+"%'></div>");
              }
              var container = $('<div class="ContainerView" style="height: 100%; display: flex; flex-flow: row wrap;"></div>');
              container.append(this.designerWraperComponent(this.components[i].components[j].render()).el);
              cell.append(container);
              ColumnTable.append(cell);
          }
            RowsTable.append(ColumnTable);
        }
        return RowsTable;
      }
    }
  });
});
