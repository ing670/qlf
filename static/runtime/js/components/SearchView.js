// # SearchView

// #author 李文奇

// 搜索输入框

// className: SearchView

// ## 配置

// 变量 | 类型 | required | 描述
// ----|------|----------|-----
// autoTrigger | bool | false | 未定议
// filterKey | string | false | 未定议
// placeholder | string | false | 输入框无输入时提示信息

// 例子：

// ```js
// {
//   type: 'SearchView',
//   options: {
//     autoTrigger:false,
//     filterKey:"",
//     placeholder:"请输入搜索内容"
//   }
// }
// ```

// ## 样式
define(['./BaseView','underscore'], function(BaseView,_){
  return BaseView.extend({
    type: 'SearchView',
    events:{
      "click .Search-icon-no-color" : "searchclick",
      "click .Search-icon" : "searchclick",
    },
    input: null,
    render: function(){
      var _this = this;
      this.$el.empty();
      // FIXME 嵌套层级太多，写死样式，css命名不符合规则！
      var SearchBox = $("<div class='Search-box'></div>");
      if (this.options.href) {
          var aCom = $("<a style='width:95%'></a>")
          aCom.attr("href", this.options.href)
          aCom.append(SearchBox);
          this.$el.append(aCom);
      } else {
          this.$el.append(SearchBox);
      }
      var SearchIconbox = $("<div></div>");
      var SearchIcon = $("<div></div>");

      var curModel = this.getModel();
      if (this.options.searchstyle == 'style2' || this.options.searchstyle == 'style4') {
        this.input = $("<input type = 'search' >");
      }else {
        this.input = $("<input type = 'search'  placeholder = " + this.options.markwords + ">");
      }

      var value = curModel && this.options.key ? curModel.get(this.options.key) : "";
      this.input.val(value);
      _addSearchDom = function() {
        SearchIconbox.append(SearchIcon);
        SearchBox.append(this.input);
        SearchBox.append(SearchIconbox);
      }.bind(this);
      _addSearchDom2 = function() {
        SearchIconbox.append(SearchIcon);
        SearchBox.append(SearchIconbox);
        SearchBox.append(this.input);
      }.bind(this);
      switch(this.options.searchstyle) {
        case "style1":
          $(SearchBox).addClass('Search-style1');
          $(SearchIconbox).addClass('Search-icon');
          $(SearchIcon).addClass('glyphicon glyphicon-search');
          _addSearchDom2();
        break;
        case "style2":
          $(SearchBox).addClass('Search-style2');
          $(SearchIconbox).addClass('Search-icon');
          $(SearchIcon).addClass('glyphicon glyphicon-search');
          _addSearchDom2();
          $(SearchIconbox).append(_this.options.markwords);
          $(_this.input).bind('input propertychange',function(){
            if ($(this).val() == "" ) {
              $(SearchIconbox).show();
            }else {
              $(SearchIconbox).hide();
            }
          });
        break;
          case "style3":
            $(SearchBox).addClass('Search-style3');
            $(SearchIconbox).addClass('Search-icon');
            $(SearchIcon).addClass('glyphicon glyphicon-search');
            _addSearchDom2();
          break;
          case "style4":
            $(SearchBox).addClass('Search-style4');
            $(SearchIconbox).addClass('Search-icon');
            $(SearchIcon).addClass('glyphicon glyphicon-search');
            _addSearchDom2();
            $(SearchIconbox).append(_this.options.markwords);
            $(_this.input).bind('input propertychange',function(){
              if ($(this).val() == "" ) {
                $(SearchIconbox).show();
              }else {
                $(SearchIconbox).hide();
              }
            });
          break;
      }
      // FIXME - get rid of the outline style
      SearchBox.css({"margin": this.options.marginTop + "px " + this.options.marginRight + "px " + this.options.marginBottom + "px " + this.options.marginLeft + "px"})
      console.log(this.options);

    //   this.$el.append(aCom);

      return this;
    },
    searchclick: function(options) {
      var param = context.getConvertContent(this,this.options.param);
      _.defaults({value:this.input.val()},param);
      this.getPage() && this.getPage().trigger("search",param);
      //this.triggerEvent("search", {value: this.input.val()});
    },
    getValue:function(){
      return this.input.val();
    },
    setValue:function(value){
      this.input.val(value);
    },
    configure: function(options) {
      var self = this;
      //var input = this.$el[0].children[0];
      // $(input).on('change',function(){
      //   options.filterValue = this.value;
      //   //TODO   组件间事件绑定: 未来直接绑定到List
      //   // self.trigger("filter",options);
      //   var query={};
      //   query[options.filterKey] = options.filterValue;
      //   if(this.value != null && this.value != ""){
      //     Backbone.trigger("search",query);
      //   }else {
      //     Backbone.trigger('search',null);
      //   }
      // });
    }
  });
});
