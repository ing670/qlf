define(['./ContainerView'], function(ContainerView) {

  return ContainerView.extend({
    // 对应到css
    type: 'ColumnLayoutView',
    defaults: {
      itemswidth: [
        "50%", "50%"
      ]
    },


    CellJDoms:[],
    render: function() {
      this.$el.empty();
      this.$el.css({"background":this.options.backgroundcolor});
      this.options.itemswidth = this.options.itemswidth || this.defaults.itemswidth;
      var ColumnTable = $("<div class='col-layout-wraper'></div>");
      this.CellJDoms = [];
      // this.options.paddings=this.options.paddings||[];
      var columnCount =  this.options.itemswidth.length;
      for (var i = 0, j = columnCount; i < j; i++) {
        var w = this.options.itemswidth[i] || "auto";
        // var padding =this.options.paddings[i]|| "";
        // padding = padding==""?"":";padding:"+padding+"";
        w = isNaN(w) ? w : w + "px";
        //var cell = $("<div class='col-layout-cell' style='width:" + w + padding +"'></div>");
        var child;
        if (i >= this.components.length) {
          var child_cfg =   {
              type:"ContainerView",
              style: {
                display: "-webkit-box",
                "-webkit-box-orient": "vertical",
                "-webkit-box-pack": "center",
                "-webkit-box-align": "start",
                "height": "100%"
              }
            };
          child = this.createComponent(child_cfg);
          this.components.push(child);
        }
        child = this.components[i];
        var processedChild = this.designerWraperComponent(child.render()).el;

        child.verticalAlignWrapper = processedChild;
        child.setContentVerticalAlign && child.setContentVerticalAlign();

        //判断分栏下一级是否ContainerView
        if(processedChild.classList.length > 0 && processedChild.classList[0] == "ContainerView") {
          //如果是ContainerView 新增一个div作为单元格
          var layoutCell = $("<div class='col-layout-cell'></div>");
          layoutCell.css({width:w});
          layoutCell.append(processedChild);
          ColumnTable.append(layoutCell);
        } else {
          //如果不是ContainerView 按照旧结构继续进行。。。
          processedChild.classList.add("col-layout-cell");
          processedChild.style.width = w;
          ColumnTable.append(processedChild);
        }

      }

      this.$el.append(ColumnTable);

      return this;
    }

  });
});
