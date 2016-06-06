define(['./BaseView', 'iscroll', 'backbone.paginator', './ContainerView', 'backbone'], function(
  BaseView, IScroll, PageableCollection,
  ContainerView, backbone) {

  var ListRow = BaseView.extend({
    type: 'ListViewRow',
    events: {
      "click": "RowClick",
      "touchstart .first-container": "onTouchstart",
      "touchmove .first-container": "onTouchmove",
      "touchend .first-container": "onTouchend",
      "click .item-delete": "delitem",
      "click .item-edit": "edititem"
    },
    edititem: function(e) {
      var param = {}
      _.each(this.options.triggers,function(item , i){
        if(item.event == "ListViewRowEdit"){
          param = context.getConvertContent(this,item.param);
          return false;
        }
      }.bind(this));
      this.triggerEvent("ListViewRowEdit", {
        id: this.model.get(this.model.idAttribute),
        collection_id: this.collection_id,
        param:param
      });
      $(this.$el.children(".first-container")).animate({
        left: '0px'
      }, 200);
      //防止事件冒泡
      e.stopPropagation();
    },
    delitem: function() {
      //先做ui动画效果,再删除
      this.$el.slideUp('fast', function() {
        if (this.model) {
          this.model.id = this.model.get('_id');
          this.model.destroy();
        }
      }.bind(this))
    },
    onTouchstart: function(e) {
      this.x = e.originalEvent.targetTouches[0].pageX // anchor point
      if (this.isEndTouch) {
        this.noTouch = true;
        $(this.$el.children(".first-container")).animate({
          left: '0px'
        }, 200);
      }
    },
    onTouchmove: function(e) {
      if (this.noTouch) {
        return;
      }
      var _this = this;
      var change = e.originalEvent.targetTouches[0].pageX - this.x
      change = Math.min(Math.max(-100, change), 100) // restrict to -100px left, 0px right
      if (change > 15) {
        return;
      }
      //正常结束的时候回推
      // if (this.isEndTouch) {
      //   this.$el.children(".ContainerView")[0].style.left =  parseInt(this.$el.children(".ContainerView")[0].style.left) + change + 'px'
      // } else {
      // }
      this.$el.children(".first-container")[0].style.left = change + 'px';

    },
    onTouchend: function(e) {
      if (this.noTouch) {
        this.noTouch = false;
        this.isEndTouch = false;
        return;
      }
      var left = parseInt(this.$el.children(".first-container")[0].style.left)
      var new_left;
      if (left < -8) {
        if (this.options.isRowDel && this.options.isRowEdit) {
          new_left = '-100px';
        } else {
          new_left = '-50px';
        }
        this.isEndTouch = true;
      } else if (-8 < left < 0) {
        new_left = '0px'
        this.isEndTouch = false;
      } else {
        new_left = '0px';
        this.isEndTouch = false;
      }
      // e.currentTarget.style.left = new_left
      $(this.$el.children(".first-container")).animate({
        left: new_left
      }, 200)
    },

    RowClick: function(e) {
      // FIXME 不要在组件中混入设计器相关的代码
      // 貌似没用，先注释，待清理

      if (!this.isInDesign) {
        //如果在弹出状态 则直接返回
        if (this.$el.children(".first-container")[0] && this.$el.children(".first-container")[0].style.left != "0px") {

          return;
        }
        var target = e.target;
        var tagName = target.tagName.toUpperCase();

        if (tagName == "INPUT" || tagName == "BUTTON") {
          var pageView = this.getPage(); // 获取组件所属的页面
          var parentPage = pageView ? pageView.type : "";
          if (parentPage.indexOf("PageView") > 0) {
            pageView.ListViewRowSelect({
              sender: this,
              arguments: {
                event: e,
                collection: this.parent.collection,
                collection_id: this.collection_id
              }
            });
          }
          return;
        }
        var param = {}
        _.each(this.options.triggers,function(item , i){
          if(item.event == "ListViewRowClick"){
            param = context.getConvertContent(this,item.param);
            return false;
          }
        }.bind(this));
        this.triggerEvent("ListViewRowClick", {
          id: this.model.get(this.model.idAttribute),
          collection_id: this.collection_id,
          param:param || {}
        });
      }
    },

    tagName: "LI",

    initialize: function(options) {
      ContainerView.prototype.initialize.apply(this, arguments);
      this.pageView = null;
      this.isInDesign = false;
      this.model = options.model;
      this.component = options.component;
      this.component.parent = this;
      this.component.setModel(this.model);
      this.id = options.listview_id;
      this.options.triggers = options.triggers
      this.collection_id = options.collection_id;
      if (options.columncount == 2) {
        this.$el.css({
          "width": "50%",
          "float": "left"
        });
      }
      this.listenTo(this.model, "destroy", this.DestroyHandle);
      this.listenTo(this.model, "change", this.render);
    },

    DestroyHandle: function() {
      this.stopListening();
      this.$el.remove();
    },
    //左滑删除 编辑
    item_options: function() {
      var wrapper = $("<div class='item-options-wrapper'></div>");
      var del = $("<a class='item-delete delete'>删除</a>");
      var edit = $("<a class='item-edit edit'>编辑</a>")
      this.options.isRowEdit && wrapper.append(edit);
      this.options.isRowDel && wrapper.append(del);
      return wrapper;
    },

    render: function() {
      this.$el.empty();
      if (this.component) {
        this.component.render();
        this.$el.append(this.designerWraperComponent(this.component).el);
        this.$el.append("<div class='yy-listrow-cover'></div>");
        //给容器set z-index
        if (this.options.isRowDel || this.options.isRowEdit) {
          this.component.$el.css({
            "z-index": 2,
            "background": "white",
            "position": "relative"
          });
          this.component.$el.addClass("first-container");
          this.$el.append(this.item_options());
        }

      }
      return this;
    },
    designerWraperComponent: function(component) {
      var compositeHandler = component.compositeHandler || this._getCompositeHandler();
      component.compositeHandler = compositeHandler;
      if (component.compositeHandler) {
        this.isInDesign = true;
        component = component.compositeHandler(component)
      }
      return component;
    },
    onRemove: function() {
      this.stopListening();
      if (this.component) {
        this.component.onRemove();
      }
      this.$el.remove();
    }

  });

  return ContainerView.extend({
    type: 'ListView',
    isContainer: true,
    events: {
      "click .nlistview-addmore": "loadMoreData"
    },
    tagName: "DIV",

    initialize: function() {
      // initial state FIXME this is rubbish code clean it ASAP
      this.listObj = null;
      this.nodata = null;
      this.iscrollObj = null;
      this.scrollWraper = null;
      this.Rows = [];
      this.number = 0;
      this.showDel = 0;
      this.designerCanDragIn = false;
      // remember the collection_name
      this.collection_name = this.options.collection_name;
      // FIXME correct the method of get collection
      this.collection = this._getCollection();
      if (this.collection) {
        this.listenTo(this.getPage(), "page:pullrefresh", this.pullrefresh);
        this.listenTo(this.getPage(), "page:pullmore", this.pullmore);
        // SearchView Event handle
        //- FIXME event doesn't registered here, correct it and remove from onRender
        this.listenTo(this.getPage(), "search", this.doSearch);
      }
    },
    render: function() {
      this.$el.empty();
      this.scrollWraper = $("<div></div>");
      this.nodata = $("<div class='nlistview-nodata'>未查询到相关数据</div>");
      this.scrollWraper.append(this.nodata);
      this.listObj = $("<ul></ul>");
      this.scrollWraper.append(this.listObj);
      // 是否需要加载更多的按钮，应该由配置决定
      this.AddMoreButton = $("<div class='nlistview-addmore'><button>加载更多</button></div>");
      this.scrollWraper.append(this.AddMoreButton);
      this.$el.append(this.scrollWraper);
      this.$el.addClass("yyn-listview");
      if (this.options.iscroll) {
        this._initIScroll();
      }
      //FIXME:详情页setmodel异步，在解析参数的的时候还无法获得model，暂时先延时处理
       setTimeout(function(){
        this._render();
      }.bind(this),100);
        return this;

    },
    _render: function() {
      // 先停止监听上一个collection
      if (this.collection) {
        this.stopListening(this.collection);
      }
      //没有collection或者collection_name变化
      if (!this.collection || this.collection_name != this.options.collection_name) {
        if (this.options.collection_name) {

          this.collection = this._getCollection();
        } else {
          this.collection = null; // reset to null
        }
      }
      // 新绑定方法
      if (this.collection) {
        this.listenTo(this.collection, 'add', this.AddRow);
        this.listenTo(this.collection, "reset", this.ResetMethod);
        this.listenTo(this.collection, "remove", function(model) {
          model && model.trigger("destroy")
        });
        //this.listenTo(this.collection, "all", this.render);
        if (!this.options.paging) {
          this.pageSize = this.collection.state.pageSize = parseInt(this.options.pageSize) ?
            parseInt(this.options.pageSize) : 5;
          this.AddMoreButton.hide();
        } else {
          this.options.pageSize = parseInt(this.options.pageSize) ? parseInt(this.options
            .pageSize) : 5;
          this.collection.state.pageSize = this.options.pageSize;
        }
        // reset and re-fetch
        this.collection.reset();
        var stringData = window.context.getConvertContent(this,this.options.param);
        var fetchOption = {};
        if(stringData){
          fetchOption.data = {"where":stringData};
        }
        this.collection.fetch(fetchOption);
      } else {
        this.AddMoreButton.hide();
      }
    },
    AddRow: function(rowmodel) {
      var RowCfg = this.options.row;
      var RowControl = this.createComponent(RowCfg);
      if ((!this.nodata[0].hidden && this.showDel == 1 && this.number == 2)
       || (!this.nodata[0].hidden && RowControl.designerCanDragIn &&
          this.number == 2)) {
        RowControl.components = [];
        this.number = 0;
      }
      var Row = new ListRow({
        model: rowmodel,
        component: RowControl,
        triggers: this.options.triggers,
        columncount: this.options.columncount,
        collection_id: this.collection.id,
        listview_id: this.options.id,
        isRowDel: this.options.isRowDel,
        isRowEdit: this.options.isRowEdit
      });
      Row.parent = this;
      // this.trigger("addRow", Row);
      this.Rows.push(Row);
      this.nodata.css({
        "display": "none"
      });

      if ((!this.nodata[0].hidden && this.showDel == 1 && this.number < 1) || (!this.nodata[
            0].hidden && RowControl.designerCanDragIn &&
          this.number < 1)) {

        var className = Row.el.className;
        Row.el.className = className + " showDel";
        this.number++;
      }
      this.listObj.append(Row.render().$el);
      var me = this;
      if (this.options.iscroll) {
        window.setTimeout(function() {
          me.iscrollObj.refresh();
        }, 0);
      }
    },
    /**
     * handle SearchView's search event
     */
    doSearch: function(arg) {
      if (this.collection && arg) {
        this.collection.queryParams["keyWord"] = arg.value;
        this.collection.reset();
        this.collection.getFirstPage();
      }
    },
    pullrefresh: function() {
      this.collection.state.currentPage = 1;
      this.collection && this.collection.fetch();
    },
    pullmore: function() {
      var _this = this;
      var models = _.map(this.collection.models, function(item) {
        return item;
      });
      try {
        this.collection.getNextPage({
          success: function() {
            if (this.collection.length < this.pageSize) {
              this.AddMoreButton.hide();
            }
            var newModels = _.map(this.collection.models, function(item) {
              return item;
            });
            this.collection.reset();
            this.collection.add(models);
            this.collection.add(newModels);
          }.bind(this)
        });
      } catch (e) {
        this.AddMoreButton.hide();
      }
    },
    onRender: function() {
      //监听页面的onResume
      var page = this.getPage();
      this.listenTo(page, 'page:resume', function() {
        if (page.params['_refresh']) {
          this.collection && this.collection.fetch();
        }
      });
      // FIXME should not put it here
      this.listenTo(this.getPage(), "search", this.doSearch);
    },
    loadMoreData: function() {
      var _this = this;
      var models = _.map(this.collection.models, function(item) {
        return item;
      });
      try {
        this.collection.getNextPage({
          success: function() {
            if (this.collection.length < this.pageSize) {
              this.AddMoreButton.hide();
            }
            var newModels = _.map(this.collection.models, function(item) {
              return item;
            });
            this.collection.reset();
            this.collection.add(models);
            this.collection.add(newModels);
          }.bind(this)
        });
      } catch (e) {
        this.AddMoreButton.hide();
      }
    },
    _getCollectionByCollectionType: function(collectionType, collectionOption) {
      var Collection;
      var _Collection = window.library.getCollection(collectionType);
      try {
        Collection = new _Collection(null, collectionOption);
      } catch (e) {
        alert(e);
      } finally {}
      return Collection;
    },
    configure: function(options) {

    },
    getConfig: function(handlers) {
      var options = _.clone(this.options);
      if (!options.type) {
        options.type = this.type;
      }
      if (this.$el.find("[data-type]")[0]) {
        var container_cid = this.$el.find("[data-type]")[0].getAttribute(
          "data-cid");
        //listview之间的嵌套，getConfig需要传入handlers，不然会报错
        options.row = handlers[container_cid].getConfig(handlers);
      }
      return options;
    },
    _getCollection: function() {
      var result;
      var collectionOption = app.collections ? app.collections[this.options.collection_name] : null
      if (!collectionOption) {
        //alert(this.options.collection_name+"数据源不存，请确认是否被删除或修改。")
        return;
      }
      if (window.application) {
        result = window.application.getCollection(collectionOption.name) || this._getCollectionByCollectionType(
          collectionOption.type, collectionOption);
      }

      return result;
    },
    isInDesign: function() {
      return this._getCompositeHandler() != null;
    },

    _initIScroll: function() {
      this.iscrollObj = new IScroll(this.el, {
        probeType: 2,
        scrollX: false,
        scrollY: true,
        scrollbars: true,
        interactiveScrollbars: true,
        shrinkScrollbars: 'scale',
        fadeScrollbars: true
      });
      if (this.options.paging !== true) {
        return;
      }
      var myScroll,
        pullDownEl, pullDownOffset,
        pullUpEl, pullUpOffset,
        generatedCount = 0,
        _this = this;

      pullUpEl = $(
        "<div class='pullUp'><span class='pullUpIcon'></span><span class='pullUpLabel'>上拉加载更多</span></div>"
      );
      pullUpOffset = 40;
      this.scrollWraper.append(pullUpEl);
      this.iscrollObj.on("refresh", function() {
        if (pullUpEl[0].className.match('loading')) {
          pullUpEl[0].className = 'pullUp';
          //
          pullUpEl[0].querySelector('.pullUpLabel').innerHTML = ('上拉加载更多...');
        }
      });
      this.iscrollObj.on("scroll", function() {

        // if (this.y > 5 && !pullDownEl.className.match('flip')) {
        //   pullDownEl.className = 'flip';
        //   pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Release to refresh...';
        //   this.minScrollY = 0;
        // } else if (this.y < 5 && pullDownEl.className.match('flip')) {
        //   pullDownEl.className = '';
        //   pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Pull down to refresh...';
        //   this.minScrollY = -pullDownOffset;
        // } else
        if (this.y < (this.maxScrollY - 5) && !pullUpEl[0].className.match('flip')) {
          pullUpEl[0].className = 'pullUp flip';
          pullUpEl[0].querySelector('.pullUpLabel').innerHTML = ('松开刷新...');
          this.maxScrollY = this.maxScrollY;
        } else if (this.y > (this.maxScrollY + 5) && pullUpEl[0].className.match(
            'flip')) {
          pullUpEl[0].className = 'pullUp';
          pullUpEl[0].querySelector('.pullUpLabel').innerHTML = ('上拉加载更多...');
          //    this.maxScrollY = pullUpOffset;
        }
      });
      this.iscrollObj.on("scrollEnd", function() {
        // if (pullDownEl.className.match('flip')) {
        //   pullDownEl.className = 'loading';
        //   pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Loading...';
        //   pullDownAction(); // Execute custom function (ajax call?)
        // } else
        if (pullUpEl[0].className.match('flip')) {
          pullUpEl[0].className = 'pullUp loading';
          pullUpEl[0].querySelector('.pullUpLabel').innerHTML = ('玩命加载中...');
          _this.trigger("ListViewLoadMore");
        }
      })
    },


    createComponent: function(cfg) {
      var Component = window.library.findClassById(cfg.type);
      if (!Component)
        throw new Error('Component ' + cfg.type + ' Not Exists.');

      var component = new Component(cfg, this);
      //      this.addChild(component); //put in the view hierachy

      //component.render(); // call render after set parent
      component.setOptions(cfg.options || cfg);


      if (cfg.options) {
        console.warn(
          "component config 'options' is deprecated, using {type: 'ImageView', src: 'xxx.png'} directly."
        );
      }

      return component;
    },

    ResetMethod: function() {
      this.listObj.empty();
      var _this = this;
      // this.collection.each(function(model) {
      //   _this.AddRow(model);
      // })
      // var me = this;
      // var models;
      // if (this.collection instanceof PageableCollection) {
      //   // for server mode, fullCollection is not valid
      //   if (this.collection.mode == 'server') {
      //     models = this.collection.models;
      //   } else {
      //     console.log(this.collection.fullCollection)
      //     models = this.collection.fullCollection.models;
      //   }
      // } else if (this.collection instanceof Array) {
      //   models = this.collection ;
      // } else {
      //   models = this.collection.models;
      // }
      // _.each(models, function(model) {
      //   me.AddRow(model);
      // });


    },

    onRemove: function() {
      this.collection && this.collection.reset();
      //alert(this.getChildren().length);
      for (var i = 0, j = this.Rows.length; i < j; i++) {
        this.Rows[i].onRemove();
      }
      this.stopListening();
      this.$el.remove();
    }

  });
});
